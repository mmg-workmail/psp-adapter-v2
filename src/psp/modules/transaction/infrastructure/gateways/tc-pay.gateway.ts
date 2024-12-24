
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { AbstractPaymentGateway } from '../abstracts/payment-gateway.abstract';
import { GatewayType } from '../enums/gateway-type';
import { TransactionService } from '../../services/db/transaction/transaction.service';
import { GatewayRegistry } from '../factories/gateway-registry';
import { TransactionStatsService } from '../../services/db/transaction-stats/transaction-stats.service';
import ResponseGeneratePaymentLink from '../interfaces/ResponseGeneratePaymentLink';
import { CreateTransactionStatsDto } from '../../dto/db/create-transaction-stats.dto';
import { TransactionStatus } from 'src/psp/enums/TransactionStatus';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import * as crypto from 'crypto';
import { Action, tcPayEncodedConfig, tcPayResponse } from '../interfaces/payments/tc-pay';



@Injectable()
export class TcPayGateway extends AbstractPaymentGateway implements OnModuleInit {
    protected gatewayType = GatewayType.TC_PAY;

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly gatewayRegistry: GatewayRegistry,
        private readonly httpService: HttpService
    ) {
        super();
    }

    async generatePaymentLink(): Promise<ResponseGeneratePaymentLink> {

        // Store Get Link Transaction Stats
        const getLinkTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.GET_LINK,
            transaction: this.transaction
        });
        await this.transactionStatsService.create(getLinkTransactionStatDto);

        await this.createIpg();

        return {
            url: ''
        }
    }

    async createIpg() {
        const config = this.gateway.encodedConfig as tcPayEncodedConfig;

        const url = config.baseUrl + config.paymentRequest;
        const payload = {
            MerchantId: config.merchantId,
            TerminalId: config.terminalId,
            Action: Action.DEPOSIT,
            // Amount: this.formatToTwoDecimalPlaces(this.transaction.amount),
            // InvoiceNumber: this.transaction.orderId,
            //LocalDateTime: this.formatDateToCustomFormat(this.transaction.createdAt),
            // ReturnUrl: config.returnUrl,
            // AdditionalData: 'test',
            // ConsumerId: this.transaction.userId,
        };

        const SignData = this.generateSign(payload);
        console.log({ ...payload, ...{ SignData } });
        const { data } = await firstValueFrom(
            this.httpService.post<tcPayResponse>(url, { ...payload, ...{ SignData } })
        );

        // Store Status Link Transaction Stats
        const getStatusLinkTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.GET_LINK_SUCCESS,
            transaction: this.transaction
        });
        if (!data.success) {
            getStatusLinkTransactionStatDto.status = TransactionStatus.GET_LINK_ERROR;
            await this.transactionStatsService.create(getStatusLinkTransactionStatDto);
            throw new BadRequestException('Create IPG is accured an error', data.description);
        }

        await this.transactionStatsService.create(getStatusLinkTransactionStatDto);


        return data
    }

    generateSign(payload: {}) {

        const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAuPh4FcwUe6JXs5sQtNH+kkd3PNM5cBVu3XN/QdqpJm/jq8QN
6sP3nSb9jgAUrXwQdrW5kLFZB1XbNRcfIyTd8WvSUraQwjymfeNm7RCKjFGfSqNn
W3jhDYlkBDa2JlNDhctSUYmCR112zjp2uMmk5dCN5fN8BA930nbU8SOvOMbGhiL4
2mVuJuiee4+Ao7RVK5pPwtWFCYWfy4bKGHHDN9I+8+Pv23avR7BpPXWJ11Mpebnk
59/sz3dIDG1+22OXBrZv+/Vvxeh3YUA24tq6lAwrdifIJ2F4dM19KjirkuPPg4XR
8EwmqyqQrtNXTajmCbwAPmSOtOnSQzK9dNYZFQIDAQABAoIBAFt030tHwMjwmBSC
E1yUiB6jn10/wyKcNljghod1KjWLFTMUmRz/ECtv3+aaO58bvLg1Wi8kwTRTSzOQ
3yBtVh/MhA3JnwGrI1cTXQzSJO8EXJJ3AN/FgOFEkWNT+fQxLy20Plt6diP7HocR
eSoc6Z+H4uFT5nnLfB9gCiHA1x5mssn8nEMA/eRxcmPMw8HsaSk4JYcAGpCRFsnH
+2gy3wJd7Lz3NnyY0eWIbOY94a7UjfuK8olRoOPCGr5fe1zj+aevH0UsaadqYw0Z
SfvafWU9ve3Zqv1sHPZEBq7T/Zw4GgO1/DvQgLyb3KotAv6YIvOJOzcQozEdI7Io
ZGIFjnECgYEA5FQGvzADp1HTWGyzFb/16E7VWa6+ouF1gR01RCQHRPLvtu4DXB/I
DzMaus26IhNZmjlKHfCifmz3zvXMvPcdieEWT22ss9wE0so9scDqcv3r09nKLfq3
U2v6ZsAxO/wnF1Dnszr4aCvOKyw7R0z+ka9Ftq/4Q927Jm4/zaovkI8CgYEAz2NB
LkK4e5xNHzXlHH9w2hgjLICQF7cHXxe/zS6bavuQJ43DGP8Hh+srQvC0nJjKRytB
r7ymfLh+B/wIrfLQumsL/WGqfD0oWw7u3xd5k4ad9oEIrwG51OAdV63rJkXTM6oZ
5tLOGVd5xoJcCvssc0saPk3U59IXiGmhk1bphhsCgYBbNOF5D7H17W6yHMGwx3xw
bsU0zOPj5pHsoIE9lfK9bRmqhgsbiqp8v9pGkpVutTIOtCHSMeSHAfo/VtqRBVls
UVh7JAFf21yl4xmf3sMIajwA5TepBESk8zYUQ2OnZYMsAip74uuFmTIC9uk7AxuR
kGUVo9dVLMZshI/CFOBpKwKBgQCj6Il6m4cdQ0J8+Wa0KFE0PkGGibHY3HK6CJYx
/7UcT+j2KgfZeK8mEIsnpADLh8LPjvOihpJ7HoGVo+/kM3Ye8D4QrCFHgjqkBWBr
+CzBmXK9gewwDUgnZF4sjyu8GxG60qUYFuKHiuiXKS7ACxZtpRz/wxoTgqvQx9PJ
FLcKowKBgQDXj09idyre0mztghe3ZQWHQ1d7DxeyDA24lIJ+LpbW9ex0E+3+4obN
JNx6c3/tXQttT+kuLv3lsdPE/DPeZw7UMxznGEg9ep3D7s6Gpqu5dADyVbjlJzSV
RLy86xDfVgZl4oNCJGM+qfYopEtUMfdTpg2s+EDFuI2cs0NeZvOceA==
-----END RSA PRIVATE KEY-----
        
        `;
        console.log(Object.values(payload).join('#').replace(' ', ''));
        const stringToBeSigned = this.toSHA256(Object.values(payload).join('#'));
        return this.signData(privateKey, stringToBeSigned);
    }

    toSHA256(input: string) {
        return crypto.createHash('sha256').update(input).digest('hex');
        // return crypto.createHash('sha256').update(input).digest();
    }
    signData(privateKey: string, stringToBeSigned: any): string {
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(stringToBeSigned);
        sign.end();

        try {
            const signature = sign.sign(privateKey, 'base64');
            return signature;

            // const signature = sign.sign(privateKey);
            // return signature.toString('base64');
        } catch (error) {
            console.log(error);
        }
        return '';
    }

    formatToTwoDecimalPlaces(value: string | number): string {
        const numberValue = parseFloat(value.toString()); // Convert to a number
        if (isNaN(numberValue)) {
            throw new Error('Invalid number format');
        }
        return numberValue.toFixed(2); // Format to two decimal places
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
    processPayment(amount: number): string {
        this.validateAmount(amount); // Use shared functionality
        this.logTransaction(amount, this.gatewayType); // Use shared functionality
        return `${this.gatewayType} payment processed: $${amount}`;
    }

    onModuleInit(): void {
        this.gatewayRegistry.register(GatewayType.TC_PAY, this);
    }
}
