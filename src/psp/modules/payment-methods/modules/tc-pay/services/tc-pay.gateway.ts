
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { GatewayType } from 'src/psp/modules/payment-methods/enums/gateway-type';

import { TransactionService } from 'src/psp/modules/transaction/services/transaction/transaction.service';
import { TransactionStatsService } from 'src/psp/modules/transaction/services/transaction-stats/transaction-stats.service';

import { TcpayVerificationTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-verification-transaction.dto';
import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/create-transaction-stats.dto';

import { TransactionStatus } from 'src/psp/enums/TransactionStatus';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { Action, ResponseGeneratePaymentLink, TcPayEncodedConfig } from 'src/psp/modules/payment-methods/modules/tc-pay/interfaces';
import { AbstractPaymentGateway } from 'src/psp/modules/payment-methods/abstracts/method-service/payment-gateway.abstract';
import { Price } from 'src/shared/classes/price/price';
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { GenerateCodeService } from 'src/shared/services/generate-code/generate-code.service';
import { TcpayCallbackTransactionDto } from '../dto/tcpay-callback-transaction.dto';
import { GatewaysService } from 'src/psp/modules/gateways/gateways.service';



@Injectable()
export class TcPayGateway extends AbstractPaymentGateway {

    private readonly logger = new Logger(TcPayGateway.name, { timestamp: true });

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly gatewaysService: GatewaysService,

        private readonly httpService: HttpService,
        private readonly generateCodeService: GenerateCodeService,
    ) {
        super()
        this.gatewayType = GatewayType.TC_PAY;
    }

    async generatePaymentLink(transaction: Transaction, gateway: Gateway): Promise<ResponseGeneratePaymentLink> {

        // Store Get Link Transaction Stats
        const getLinkTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.GET_LINK,
            transaction: transaction
        });
        await this.transactionStatsService.create(getLinkTransactionStatDto);

        const { url } = await this.createIpg(transaction, gateway);
        return {
            url: url
        }
    }

    async createIpg(transaction: Transaction, gateway: Gateway) {

        transaction.externalTrackNumber = `${transaction.id}${this.generateCodeService.generateNumericCode(4)}`;
        this.transactionService.create(transaction);

        const config = gateway.encodedConfig as TcPayEncodedConfig;

        const payload = {
            MerchantId: parseInt(config.merchantId),
            TerminalId: parseInt(config.terminalId),
            Action: Action.DEPOSIT,
            Amount: Price.formatToTwoDecimalPlaces(transaction.amount),
            InvoiceNumber: transaction.externalTrackNumber,
            LocalDateTime: this.formatDateToCustomFormat(transaction.createdAt),
            ReturnUrl: config.returnUrl,
            AdditionalData: 'ePlanet',
            ConsumerId: transaction.userId,
        };

        const token = await this.generateToken(payload, transaction, gateway);

        transaction.externalOrderId = token;
        this.transactionService.create(transaction);

        return {
            url: `${config.generateLinkPayment}?url=${config.baseUrl}&token=${token}`
        }
    }

    async generateToken(payload: {}, transaction: Transaction, gateway: Gateway) {

        const config = gateway.encodedConfig as TcPayEncodedConfig;

        const params = {
            ...payload,
            private_key: config.privateKeyXml,
            generate_url: config.baseUrl + config.paymentRequest
        };

        const { data } = await firstValueFrom(
            this.httpService.post<{ Token: string, responseDescription: string }>(config.generateSignUrl, params)
        );

        if (!data.Token) {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.GET_LINK_ERROR,
                transaction: transaction
            });

            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);

            const message = `Create IPG is accured an error "${data.responseDescription}"`;
            this.logger.error(message);
            throw new BadRequestException(message);
        } else {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.GET_LINK_SUCCESS,
                transaction: transaction
            });
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
        }

        return data.Token
    }

    formatDateToCustomFormat(dateString: Date): string {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
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

        this.logger.log('payload of TcPay verification', JSON.stringify(data));


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


    async checkCallback(payload: TcpayCallbackTransactionDto): Promise<Transaction> {
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

        const resCode = parseInt(payload.resCode);
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
        transaction.requestDepositAmount = paymentVerificationResult.data.amount;

        await this.transactionService.save(transaction);

        return transaction;

    }

}
