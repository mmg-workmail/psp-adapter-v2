
import { BadRequestException, Injectable } from '@nestjs/common';

import { GatewayType } from 'src/psp/modules/payment-methods/enums/gateway-type';

import { TransactionService } from 'src/psp/modules/transaction/services/transaction/transaction.service';
import { TransactionStatsService } from 'src/psp/modules/transaction/services/transaction-stats/transaction-stats.service';

import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/create-transaction-stats.dto';

import { TransactionStatus } from 'src/psp/enums/TransactionStatus';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { Action, ResponseGeneratePaymentLink, TcPayEncodedConfig } from 'src/psp/modules/payment-methods/modules/tc-pay/interfaces';
import { AbstractPaymentGateway } from 'src/psp/modules/payment-methods/abstracts/method-service/payment-gateway.abstract';
import { Price } from 'src/shared/classes/price/price';



@Injectable()
export class TcPayGateway extends AbstractPaymentGateway {

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly httpService: HttpService
    ) {
        super()
        this.gatewayType = GatewayType.TC_PAY;
    }

    async generatePaymentLink(): Promise<ResponseGeneratePaymentLink> {

        // Store Get Link Transaction Stats
        const getLinkTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.GET_LINK,
            transaction: this.transaction
        });
        await this.transactionStatsService.create(getLinkTransactionStatDto);

        const { url } = await this.createIpg();
        return {
            url: url
        }
    }

    async createIpg() {

        const config = this.gateway.encodedConfig as TcPayEncodedConfig;

        const payload = {
            MerchantId: parseInt(config.merchantId),
            TerminalId: parseInt(config.terminalId),
            Action: Action.DEPOSIT,
            Amount: Price.formatToTwoDecimalPlaces(this.transaction.amount),
            InvoiceNumber: this.transaction.id,
            LocalDateTime: this.formatDateToCustomFormat(this.transaction.createdAt),
            ReturnUrl: config.returnUrl,
            AdditionalData: 'test',
            ConsumerId: this.transaction.userId,
        };

        const token = await this.generateToken(payload, config);

        this.transaction.externalOrderId = token;
        this.transactionService.create(this.transaction);

        // Store Status Link Transaction Stats
        const getOpenTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.OPENED,
            transaction: this.transaction
        });
        await this.transactionStatsService.create(getOpenTransactionStatDto);


        // Store Status Link Transaction Stats
        const getPendingTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.PENDING,
            transaction: this.transaction
        });
        await this.transactionStatsService.create(getPendingTransactionStatDto);

        return {
            url: `${config.generateLinkPayment}?url=${config.baseUrl}&token=${token}`
        }
    }

    async generateToken(payload: {}, config: TcPayEncodedConfig) {
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
                transaction: this.transaction
            });

            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
            throw new BadRequestException('Create IPG is accured an error', data.responseDescription);
        } else {
            // Store Status Link Transaction Stats
            const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.GET_LINK_SUCCESS,
                transaction: this.transaction
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
}
