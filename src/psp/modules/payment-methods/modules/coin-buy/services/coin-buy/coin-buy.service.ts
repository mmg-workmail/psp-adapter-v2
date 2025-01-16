import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AbstractPaymentGateway } from 'src/psp/modules/payment-methods/abstracts/method-service/payment-gateway.abstract';
import { GatewayType } from 'src/psp/modules/payment-methods/enums/gateway-type';
import { TransactionStatsService } from 'src/psp/modules/transaction/services/transaction-stats/transaction-stats.service';
import { TransactionService } from 'src/psp/modules/transaction/services/transaction/transaction.service';

import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { ResponseGeneratePaymentLink } from '../../../tc-pay/interfaces';
import { AuthCredentials } from '../../interfaces/authentication';
import { CoinBuyEncodedConfig } from '../../interfaces';
import { RequestCoinBuy, RequestCoinBuyDeposit, RequestCoinBuyLogin, RequestCoinBuyRefreshToken, RequestCoinBuyRelationships } from '../../interfaces/request';
import { firstValueFrom } from 'rxjs';
import { TypeCoinBuy } from '../../enums/typeCoinBuy';
import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/create-transaction-stats.dto';
import { TransactionStatus } from 'src/psp/enums/TransactionStatus';
import { ResponseCoinBuy, ResponseCoinBuyDeposit, ResponseCoinBuyRefreshToken, ResponseCoinBuyRelationships, ResponseCoinBuyToken } from '../../interfaces/response';
import { GenerateCodeService } from 'src/shared/services/generate-code/generate-code.service';

@Injectable()
export class CoinBuyService extends AbstractPaymentGateway implements OnModuleInit {

    private readonly logger = new Logger(CoinBuyService.name, { timestamp: true });

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly httpService: HttpService,
        private readonly generateCodeService: GenerateCodeService,
    ) {
        super()
        this.gatewayType = GatewayType.COIN_BUY;
    }
    private authCredentials: AuthCredentials;
    private config: CoinBuyEncodedConfig;

    onModuleInit() {
        this.httpService.axiosRef.defaults.headers.common['Content-Type'] = 'application/vnd.api+json';
        this.setToken();
    }

    private getConfig(gateway: Gateway) {
        if (!this.config) {
            this.config = gateway.encodedConfig as CoinBuyEncodedConfig
        }
    }
    private async setToken() {
        if (this.authCredentials?.token) {
            this.httpService.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${this.authCredentials.token}`
        }
    }
    private async removeToken() {
        delete this.httpService.axiosRef.defaults.headers.common['Authorization'];
    }
    private async loggin() {

        const url = this.config.baseUrl + this.config.authToken;
        const payload: RequestCoinBuy<RequestCoinBuyLogin> = {
            data: {
                type: TypeCoinBuy.AUTH_TOKEN,
                attributes: {
                    login: this.config.login,
                    password: this.config.password
                }
            }
        }

        const { data, status } = await firstValueFrom(
            this.httpService.post<ResponseCoinBuy<ResponseCoinBuyToken>>(url, payload)
        );

        if (status === HttpStatus.OK) {
            this.authCredentials = {
                token: data.data.attributes.access,
                refresh: data.data.attributes.refresh,
                access_expired_at: data.data.attributes.access_expired_at,
                refresh_expired_at: data.data.attributes.refresh_expired_at,
            }
            this.setToken();
        } else {
            const message = `Loggin has accured, Response code is : ${status}`
            this.logger.error(message);
            throw new BadRequestException(message);
        }

    }
    private async refreshAuthToken() {
        const url = this.config.baseUrl + this.config.authTokenRefresh;
        const payload: RequestCoinBuy<RequestCoinBuyRefreshToken> = {
            data: {
                type: TypeCoinBuy.AUTH_TOKEN,
                attributes: {
                    refresh: this.config.login
                }
            }
        }

        const { data, status } = await firstValueFrom(
            this.httpService.post<ResponseCoinBuy<ResponseCoinBuyRefreshToken>>(url, payload)
        );

        if (status === HttpStatus.OK) {
            this.authCredentials = {
                token: data.data.attributes.access,
                refresh: data.data.attributes.refresh,
                access_expired_at: data.data.attributes.access_expired_at,
                refresh_expired_at: data.data.attributes.refresh_expired_at,
            }
            this.setToken();
        } else {
            const message = `Refresh token has accured, Response code is : ${status}`
            this.logger.error(message);
            throw new BadRequestException(message);
        }
    }
    private isAccessExpired() {
        const currentTime = new Date();
        const expirationTime = new Date(this.authCredentials.access_expired_at);
        const result = currentTime > expirationTime;

        this.logger.warn('Access Token Is Expired');

        return result;
    }
    private isRefreshExpired() {
        const currentTime = new Date();
        const expirationTime = new Date(this.authCredentials.refresh_expired_at);
        const result = currentTime > expirationTime;

        this.logger.warn('Refresh Token Is Expired');

        return result;
    }
    private async checkAuthenticated(): Promise<boolean> {
        let result = true

        if (!this.authCredentials) {
            await this.loggin();
        } else {
            if (this.isAccessExpired()) {
                this.removeToken();
                if (this.isRefreshExpired()) {
                    await this.loggin()
                } else {
                    await this.refreshAuthToken()
                }
            }
        }
        return result;
    }

    private async createDeposit(transaction: Transaction) {
        const url = this.config.baseUrl + this.config.paymentRequest;
        const payload: RequestCoinBuy<RequestCoinBuyDeposit, RequestCoinBuyRelationships> = {
            data: {
                type: TypeCoinBuy.DEPOSIT,
                attributes: {
                    label: 'ePlanet Deposit',
                    tracking_id: transaction.externalTrackNumber,
                    confirmations_needed: 1,
                    callback_url: this.config.callbackUrl,
                    payment_page_redirect_url: this.config.paymentPageRedirectUrl,
                    payment_page_button_text: this.config.paymentPageButtonText
                },
                relationships: {
                    wallet: {
                        data: {
                            type: TypeCoinBuy.WALLET,
                            id: this.config.walletId,
                        }
                    }
                }
            }
        }

        const { data, status } = await firstValueFrom(
            this.httpService.post<ResponseCoinBuy<ResponseCoinBuyDeposit, ResponseCoinBuyRelationships>>(url, payload)
        );
        if (status < 200 || status >= 300) {
            if (status === 401) {
                this.logger.error('Create deposit Is failed 401');
                this.removeToken()
            }
            // Store Get Link Error Transaction Stats
            const getLinkTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.GET_LINK_ERROR,
                transaction: transaction
            });
            await this.transactionStatsService.create(getLinkTransactionStatDto);
            const message = `Loggin has accured, Response code is : ${status}`

            this.logger.error(message);
            throw new BadRequestException(message);
        }

        return {
            url: data.data.attributes.payment_page
        }

    }

    async createIpg(transaction: Transaction) {

        // Store Get Link Transaction Stats
        const getLinkTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.GET_LINK,
            transaction: transaction
        });
        await this.transactionStatsService.create(getLinkTransactionStatDto);

        transaction.externalTrackNumber = this.generateCodeService.generateTrackingCode();
        this.transactionService.save(transaction)

        const { url } = await this.createDeposit(transaction)


        // Store Get Link Success Transaction Stats
        const getLinkSuccessTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.GET_LINK_SUCCESS,
            transaction: transaction
        });
        await this.transactionStatsService.create(getLinkSuccessTransactionStatDto);

        return {
            url: url
        }

    }

    async generatePaymentLink(transaction: Transaction, gateway: Gateway): Promise<ResponseGeneratePaymentLink> {

        // set Config
        this.getConfig(gateway);

        // check authentication
        await this.checkAuthenticated();

        const { url } = await this.createIpg(transaction);
        return {
            url: url
        }

    }
}
