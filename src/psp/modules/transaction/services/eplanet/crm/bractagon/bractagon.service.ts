import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MerchantService } from 'src/psp/modules/merchant/merchant.service';
import { BractagonOpenTransactionDto } from 'src/psp/modules/transaction/dto/eplanet/crm/bractagon/bractagon-open-transaction.dto';
import { TransactionService } from '../../../db/transaction/transaction.service';
import { TransactionStatsService } from '../../../db/transaction-stats/transaction-stats.service';
import { GatewaysService } from 'src/psp/modules/gateways/gateways.service';
import { CreateTransactionDto } from 'src/psp/modules/transaction/dto/db/create-transaction.dto';
import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/db/create-transaction-stats.dto';
import { TransactionStatus } from 'src/psp/enums/TransactionStatus';
import { PaymentService } from 'src/psp/modules/transaction/infrastructure/services/payment.service';
import { BractagonResponseGeneratePaymentLink } from 'src/psp/modules/transaction/infrastructure/interfaces/eplanet/crm/bractagon/bractagon-response-generate-payment-link.interface';

@Injectable()
export class BractagonService {

    private readonly logger = new Logger(BractagonService.name, { timestamp: true });

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly merchantService: MerchantService,
        private readonly gatewaysService: GatewaysService,
        private readonly paymentService: PaymentService,
    ) { }

    async openPayment(bractagonOpenTransactionDto: BractagonOpenTransactionDto): Promise<BractagonResponseGeneratePaymentLink> {

        this.logger.log("start open gateway with orderId: " + bractagonOpenTransactionDto.order_no);

        // Check Transaction with Order_id
        const checkTransactionWithOrderId = await this.transactionService.checkOrderId(bractagonOpenTransactionDto.order_no)
        if (checkTransactionWithOrderId) {
            const message = "The transaction is existed : " + bractagonOpenTransactionDto.order_no;
            this.logger.error(message);
            throw new BadRequestException(message);
        }

        // Check Merchant
        const merchant = await this.merchantService.findOneByMerchantId(bractagonOpenTransactionDto.merchant_id);
        if (!merchant) {
            const message = "The merchant is not exist : " + bractagonOpenTransactionDto.merchant_id;
            this.logger.error(message);
            throw new BadRequestException(message);
        }

        // Check Gateway
        const gateway = await this.gatewaysService.findOneByMerchantId(merchant.merchantId);
        if (!gateway) {
            const message = "The gateway is not exist with: " + bractagonOpenTransactionDto.merchant_id;
            this.logger.error(message);
            throw new BadRequestException(message);
        }


        // Store Transaction
        const createTransactionDto = new CreateTransactionDto({
            userId: bractagonOpenTransactionDto.user_id,
            username: bractagonOpenTransactionDto.user_name,
            orderId: bractagonOpenTransactionDto.order_no,
            amount: bractagonOpenTransactionDto.amount,
            currency: bractagonOpenTransactionDto.currency,
            merchant: merchant,
        });
        const transaction = await this.transactionService.create(createTransactionDto);
        this.logger.log(`Transaction was created with id : ${transaction.id}`);


        // Store Initiated Transaction Stats
        const initiatedTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.INITIATED,
            transaction: transaction
        });
        await this.transactionStatsService.create(initiatedTransactionStatDto);

        // Find Gateway Type
        const gatewayType = gateway.type
        this.logger.log(`The gateway type is ${gatewayType}`);

        // Payment Provider
        const paymentProvider = this.paymentService.processPayment(gatewayType);

        // Store Sent Transaction Stats
        const sentTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.SENT,
            transaction: transaction
        });
        const sentTransactionStats = await this.transactionStatsService.create(sentTransactionStatDto);

        const result = await paymentProvider
            .setGateway(gateway)
            .setTransaction(transaction)
            .setTransactionStats(sentTransactionStats)
            .generatePaymentLink();

        const bractagonResponseGeneratePaymentLink: BractagonResponseGeneratePaymentLink = {
            data: {
                url: result.url
            },
            result: true,
            msg: ""
        };

        return bractagonResponseGeneratePaymentLink;
    }
}
