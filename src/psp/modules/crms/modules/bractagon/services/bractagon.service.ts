import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MerchantService } from 'src/psp/modules/merchant/merchant.service';
import { BractagonOpenTransactionDto } from '../dto/bractagon-open-transaction.dto';
import { TransactionService } from 'src/psp/modules/transaction/services/transaction/transaction.service';
import { TransactionStatsService } from 'src/psp/modules/transaction/services/transaction-stats/transaction-stats.service';
import { GatewaysService } from 'src/psp/modules/gateways/gateways.service';
import { CreateTransactionDto } from 'src/psp/modules/transaction/dto/create-transaction.dto';
import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/create-transaction-stats.dto';
import { TransactionStatus } from 'src/psp/enums/TransactionStatus';
import { BractagonResponseGeneratePaymentLink } from '../interfaces/bractagon-response-generate-payment-link.interface';


import { TcPayGateway } from 'src/psp/modules/payment-methods/modules/tc-pay/services/tc-pay.gateway';
import { GatewayType } from 'src/psp/modules/payment-methods/enums/gateway-type';
import { TcpayCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-callback-transaction.dto copy';
import { Signature } from 'src/shared/classes/signature/signature';
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { Merchant } from 'src/psp/modules/merchant/entities/merchant.entity';
import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { BractagonCallbackTransactionDto } from '../dto/bractagon-callback-transaction.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { TcPayEncodedConfig } from 'src/psp/modules/payment-methods/modules/tc-pay/interfaces';

@Injectable()
export class BractagonService {

    private readonly logger = new Logger(BractagonService.name, { timestamp: true });

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly merchantService: MerchantService,
        private readonly gatewaysService: GatewaysService,
        private readonly httpService: HttpService,

        private readonly tcPayGateway: TcPayGateway,
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
        const paymentProvider = this.processPaymentProvider(gatewayType);

        // Store Sent Transaction Stats
        const sentTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.SENT,
            transaction: transaction
        });
        const sentTransactionStats = await this.transactionStatsService.create(sentTransactionStatDto);

        const result = await paymentProvider.generatePaymentLink(transaction, gateway);

        const bractagonResponseGeneratePaymentLink: BractagonResponseGeneratePaymentLink = {
            data: {
                url: result.url
            },
            result: true,
            msg: ""
        };

        return bractagonResponseGeneratePaymentLink;
    }

    async callbackPayment(tcpayCallbackTransactionDto: TcpayCallbackTransactionDto) {

        const transaction = await this.transactionService.checkExternalOrderId(tcpayCallbackTransactionDto['data.Token']);
        const merchant = transaction.merchant;

        await this.sendCallbackPayment(transaction, merchant);

        const gateway = await this.gatewaysService.findOneByMerchantId(merchant.merchantId);
        const config = gateway.encodedConfig as TcPayEncodedConfig;

        return { url: config.approveUrl, statusCode: 301 };

    }

    processPaymentProvider(gatewayType: GatewayType) {

        switch (gatewayType) {
            case GatewayType.TC_PAY:
                return this.tcPayGateway;
                break;
            default:
                return this.tcPayGateway;
                break;
        }
    }

    async sendCallbackPayment(transaction: Transaction, merchant: Merchant) {

        const body: BractagonCallbackTransactionDto = {
            merchant_id: merchant.merchantId,
            order_no: transaction.orderId,
            transaction_id: transaction.externalTrackNumber,
            amount: transaction.actualDepositAmount,
            currency: transaction.currency,
            time: +new Date(),
            status: 1,
        };

        // Generate Sign
        const sign = new Signature(merchant.token);
        body.sign = sign.generateSignature(body);

        const headers = {
            'crm-pay-token': merchant.token,
        };

        try {

            await firstValueFrom(
                this.httpService.post(merchant.callbackUrl, body, { headers })
            );

            const TransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.SUCCESS,
                transaction: transaction
            });
            await this.transactionStatsService.create(TransactionStatDto);

        } catch (error) {

            const TransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.ERROR,
                transaction: transaction
            });

            await this.transactionStatsService.create(TransactionStatDto);
            this.logger.error(`Transaction was accured, Transaction ID : ${transaction.id}, with : ${error}`);
            throw new BadRequestException('Transaction was accured an error ');

        }


    }

}
