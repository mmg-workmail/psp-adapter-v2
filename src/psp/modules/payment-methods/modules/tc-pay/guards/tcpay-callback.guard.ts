import { BadRequestException, CanActivate, ExecutionContext, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';


import { plainToInstance } from 'class-transformer';

import { TransactionService } from 'src/psp/modules/transaction/services/transaction/transaction.service';
import { TransactionStatsService } from 'src/psp/modules/transaction/services/transaction-stats/transaction-stats.service';
import { GatewaysService } from 'src/psp/modules/gateways/gateways.service';

import { TcpayVerificationTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-verification-transaction.dto';
import { TcpayCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-callback-transaction.dto copy';
import { TransactionStatus } from 'src/psp/enums/TransactionStatus';
import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/create-transaction-stats.dto';
import { TcPayEncodedConfig } from '../interfaces';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { Price } from 'src/shared/classes/price/price';


@Injectable()
export class TcpayCallbackGuard implements CanActivate {

    private readonly logger = new Logger(TcpayCallbackGuard.name, { timestamp: true });
    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly gatewaysService: GatewaysService,

        private readonly httpService: HttpService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request = context.switchToHttp().getRequest<Request>();

        // Transform the plain payload into a DTO instance
        const payload = plainToInstance(TcpayCallbackTransactionDto, request.body);

        const resCode = parseInt(payload.resCode);
        this.logger.log('payload', JSON.stringify(payload));

        const transaction = await this.transactionService.checkExternalOrderId(payload['data.Token']);
        if (!transaction) {
            this.logger.error(`Transaction with this ${payload['data.Token']} not found`);
            throw new NotFoundException('Transaction is not found');
        }

        if (transaction.externalTrackNumber) {
            this.logger.error(`Transaction was already done, Transaction ID : ${transaction.id}`);
            throw new BadRequestException('Transaction was already done');
        }

        const transactionStats = await this.transactionStatsService.findLastItem(transaction.id);
        if (!transactionStats) {
            this.logger.error(`Transaction status is not found, Transaction ID : ${transaction.id}`);
            throw new NotFoundException('Transaction status is not found');
        }

        if (resCode) {
            // Store Error Transaction Stats
            const errorTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.PROCESSING_FAILED,
                transaction: transaction
            });
            await this.transactionStatsService.create(errorTransactionStatDto);
            this.logger.error(`Payment operation is not successful, Transaction ID : ${transaction.id} with res code : ${resCode}`);
            throw new BadRequestException('Payment operation is not successful', payload.description);
        }

        const gateway = await this.gatewaysService.findOneByMerchantId(transaction.merchant.merchantId);


        const paymentVerificationResult: TcpayVerificationTransactionDto = await this.checkPaymentVerification(payload, gateway, transaction);

        transaction.externalTrackNumber = paymentVerificationResult.data.transactionId;
        transaction.actualDepositAmount = paymentVerificationResult.data.amount;

        await this.transactionService.save(transaction);

        return true;
    }

    async checkPaymentVerification(payload: TcpayCallbackTransactionDto, gateway: Gateway, transaction: Transaction): Promise<TcpayVerificationTransactionDto> {

        const config = gateway.encodedConfig as TcPayEncodedConfig;

        const params = {
            token: payload['data.Token'],
            private_key: config.privateKeyXml,
            generate_url: config.baseUrl + config.paymentVerification
        };

        const getAuthenticationStartTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.AUTHENTICATION_START,
            transaction: transaction
        });
        await this.transactionStatsService.create(getAuthenticationStartTransactionStatDto);

        const { data } = await firstValueFrom(
            this.httpService.post<TcpayVerificationTransactionDto>(config.generateSignVerify, params)
        );

        if (parseInt(data.resCode) > 0) {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.AUTHENTICATION_ERROR,
                transaction: transaction
            });
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);

            this.logger.error(`Transaction was rejected By Tc-pay, Transaction ID : ${transaction.id} With res code : ${data.resCode} and this is description : ${data.description}`);
            throw new BadRequestException('Transaction was rejected By Tc-pay', data.description);
        } else {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.RESULT_RECEIVED,
                transaction: transaction
            });
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
        }

        if (Price.formatToTwoDecimalPlaces(transaction.amount) != Price.formatToTwoDecimalPlaces(data.data.amount)) {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.PROCESSING_FAILED,
                transaction: transaction
            });
            this.logger.error(`Transaction was rejected They are not same amount, Transaction ID : ${transaction.id}`);
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
            throw new BadRequestException('Transaction was rejected ');
        }

        const existTransaction = await this.transactionService.checkExternalTrackNumber(data.data.transactionId)
        if (existTransaction) {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.PROCESSING_FAILED,
                transaction: transaction
            });
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
            this.logger.error(`Transaction was rejected it was exist transaction, Transaction ID : ${transaction.id}`);
            throw new BadRequestException('Transaction was rejected ');
        }

        // Store Status Link Transaction Stats
        const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.AUTHENTICATION_APPROVED,
            transaction: transaction
        });
        await this.transactionStatsService.create(getStatusLinkTransactionStatDto);

        return data
    }

}
