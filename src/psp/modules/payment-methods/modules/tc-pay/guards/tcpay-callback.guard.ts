import { BadRequestException, CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';


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

    private transaction: Transaction;
    private gateway: Gateway;

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

        this.transaction = await this.transactionService.checkExternalOrderId(payload['data.Token']);
        if (!this.transaction) {
            this.logger.error(`Transaction with this ${payload['data.Token']} not found`);
            throw new UnauthorizedException('Transaction is not found');
        }

        if (this.transaction.externalTrackNumber) {
            this.logger.error(`Transaction was already done, Transaction ID : ${this.transaction.id}`);
            throw new UnauthorizedException('Transaction was already done');
        }

        const transactionStats = await this.transactionStatsService.findLastItem(this.transaction.id);
        if (!transactionStats) {
            this.logger.error(`Transaction status is not found, Transaction ID : ${this.transaction.id}`);
            throw new UnauthorizedException('Transaction status is not found');
        }

        if (resCode) {
            // Store Error Transaction Stats
            const errorTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.ERROR,
                transaction: this.transaction
            });
            await this.transactionStatsService.create(errorTransactionStatDto);
            this.logger.error(`Payment operation is not successful, Transaction ID : ${this.transaction.id}`);
            throw new UnauthorizedException('Payment operation is not successful');
        }

        this.gateway = await this.gatewaysService.findOneByMerchantId(this.transaction.merchant.merchantId);


        const paymentVerificationResult: TcpayVerificationTransactionDto = await this.checkPaymentVerification(payload);

        this.transaction.externalTrackNumber = paymentVerificationResult.data.transactionId;
        this.transaction.actualDepositAmount = paymentVerificationResult.data.amount;

        await this.transactionService.save(this.transaction);

        return true;
    }

    async checkPaymentVerification(payload: TcpayCallbackTransactionDto): Promise<TcpayVerificationTransactionDto> {

        const config = this.gateway.encodedConfig as TcPayEncodedConfig;

        const params = {
            token: payload['data.Token'],
            private_key: config.privateKeyXml,
            generate_url: config.baseUrl + config.paymentVerification
        };

        const { data } = await firstValueFrom(
            this.httpService.post<TcpayVerificationTransactionDto>(config.generateSignVerify, params)
        );

        if (parseInt(data.resCode) > 0) {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.AUTHENTICATION_ERROR,
                transaction: this.transaction
            });

            this.logger.error(`Transaction was rejected By Tc-pay, Transaction ID : ${this.transaction.id}`);

            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
            throw new BadRequestException('Transaction was rejected By Tc-pay', data.description);
        } else {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.AUTHENTICATION_APPROVED,
                transaction: this.transaction
            });
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
        }

        if (Price.formatToTwoDecimalPlaces(this.transaction.amount) != Price.formatToTwoDecimalPlaces(data.data.amount)) {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.AUTHENTICATION_ERROR,
                transaction: this.transaction
            });
            this.logger.error(`Transaction was rejected They are not same amount, Transaction ID : ${this.transaction.id}`);
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
            throw new BadRequestException('Transaction was rejected ');
        }

        return data
    }

}
