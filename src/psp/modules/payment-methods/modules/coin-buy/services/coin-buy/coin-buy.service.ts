import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, UnauthorizedException, HttpException } from '@nestjs/common';
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
import { CoinBuyCallbackTransactionDto, IncludedTransferDto, MetaDto } from '../../dto/coinbuy-callback-transaction.dto';
import { SignatureForCoinBuy } from '../../classes/signature/signature';
import { GatewaysService } from 'src/psp/modules/gateways/gateways.service';

@Injectable()
export class CoinBuyService extends AbstractPaymentGateway {

    private readonly logger = new Logger(CoinBuyService.name, { timestamp: true });

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionStatsService: TransactionStatsService,
        private readonly gatewaysService: GatewaysService,

        private readonly httpService: HttpService,
        private readonly generateCodeService: GenerateCodeService,
    ) {
        super()
        this.gatewayType = GatewayType.COIN_BUY;
    }
    private authCredentials: AuthCredentials;
    private config: CoinBuyEncodedConfig;

    private headers = {
        'Content-Type': 'application/vnd.api+json'
    }

    private getConfig(gateway: Gateway) {
        this.config = gateway.encodedConfig as CoinBuyEncodedConfig
    }
    private async setToken() {
        if (this.authCredentials?.token) {
            this.httpService.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${this.authCredentials.token}`
        }
    }
    private remoteAuth() {
        this.authCredentials = undefined;
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

        this.logger.log('loggin', JSON.stringify(payload), JSON.stringify(url));

        try {
            const { data, status } = await firstValueFrom(
                this.httpService.post<ResponseCoinBuy<ResponseCoinBuyToken>>(url, payload, { headers: this.headers })
            );

            if (status === HttpStatus.OK) {
                this.authCredentials = {
                    token: data.data.attributes.access,
                    refresh: data.data.attributes.refresh,
                    access_expired_at: data.data.attributes.access_expired_at,
                    refresh_expired_at: data.data.attributes.refresh_expired_at,
                }
            } else {
                const message = `Loggin was accured, Response code is : ${status}`
                this.logger.error(message);
                throw new BadRequestException(message);
            }

        } catch (error) {
            const errorMessage = error?.response?.data || `Loggin was accured`;
            this.logger.error(errorMessage, error);
            throw new BadRequestException('Loggin was accured');
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

        this.logger.log('Refresh Auth Token', JSON.stringify(payload), JSON.stringify(url));

        try {
            const { data, status } = await firstValueFrom(
                this.httpService.post<ResponseCoinBuy<ResponseCoinBuyRefreshToken>>(url, payload, { headers: this.headers })
            );

            if (status === HttpStatus.OK) {
                this.authCredentials = {
                    token: data.data.attributes.access,
                    refresh: data.data.attributes.refresh,
                    access_expired_at: data.data.attributes.access_expired_at,
                    refresh_expired_at: data.data.attributes.refresh_expired_at,
                };
            } else {
                const message = `Refresh token error occurred, Response code is: ${status}`;
                this.logger.error(message);
                throw new BadRequestException(message);
            }
        } catch (error) {
            this.authCredentials = null;
            this.logger.error('Error during refresh token process', error);
            throw new BadRequestException('Error during refresh token process');
        }

    }
    private isAccessExpired() {
        const currentTime = new Date();
        const expirationTime = new Date(this.authCredentials.access_expired_at);
        const result = currentTime > expirationTime;

        if (result) {
            this.logger.warn('Access Token Is Expired');
        }
        return result;
    }
    private isRefreshExpired() {
        const currentTime = new Date();
        const expirationTime = new Date(this.authCredentials.refresh_expired_at);
        const result = currentTime > expirationTime;

        if (result) {
            this.logger.warn('Refresh Token Is Expired');
        }
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
        const headers = {
            Authorization: `Bearer ${this.authCredentials.token}`
        };

        const payload: RequestCoinBuy<RequestCoinBuyDeposit, RequestCoinBuyRelationships> = {
            data: {
                type: TypeCoinBuy.DEPOSIT,
                attributes: {
                    label: transaction.orderId,
                    tracking_id: transaction.externalTrackNumber,
                    confirmations_needed: 2,
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

        this.logger.log('create deposit', JSON.stringify(payload), JSON.stringify(url));

        const { data, status, statusText } = await firstValueFrom(
            this.httpService.post<ResponseCoinBuy<ResponseCoinBuyDeposit, ResponseCoinBuyRelationships>>(url, payload, { headers: { ...headers, ...this.headers } })
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

            this.logger.error(statusText);
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

    async checkSignature(transaction: Transaction, lastIncludedTransfer: IncludedTransferDto, meta: MetaDto, trackingId: string): Promise<boolean> {
        let result = true;

        const callbackSign = meta.sign;
        const callbackTime = meta.time;

        const status = lastIncludedTransfer.attributes.status;
        const amount = lastIncludedTransfer.attributes.amount;

        const tracking_id = trackingId;

        // prepare data for hash check
        const message = status + amount + tracking_id + callbackTime;

        const gateway = await this.gatewaysService.findOneByMerchantId(transaction.merchant.merchantId);
        const coinBuyEncodedConfig = gateway.encodedConfig as CoinBuyEncodedConfig;
        const coinBuyLoggin = coinBuyEncodedConfig.login;
        const coinBuyPassword = coinBuyEncodedConfig.password;

        // Store Start Transaction Stats
        const getStartTransactionStatDto = new CreateTransactionStatsDto({
            status: TransactionStatus.AUTHENTICATION_START,
            transaction: transaction
        });
        await this.transactionStatsService.create(getStartTransactionStatDto);

        const sign = new SignatureForCoinBuy();
        const isValid = sign.isValid(callbackSign, message, coinBuyLoggin, coinBuyPassword);

        if (!isValid) {
            // Store Error Transaction Stats
            const getErrorTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.AUTHENTICATION_ERROR,
                transaction: transaction
            });
            await this.transactionStatsService.create(getErrorTransactionStatDto);

            result = false;
            this.logger.error(`Signature is not valid`);
            throw new UnauthorizedException('callback is not valid!');
        } else {
            // Store Approved Transaction Stats
            const getApprovedTransactionStatDto = new CreateTransactionStatsDto({
                status: TransactionStatus.AUTHENTICATION_APPROVED,
                transaction: transaction
            });
            await this.transactionStatsService.create(getApprovedTransactionStatDto);
        }

        return result;

    }
    async checkCallback(payload: CoinBuyCallbackTransactionDto): Promise<Transaction> {


        // Filter the included array for items of type 'transfer'
        const includedTransfer = payload.included.filter(item => item.type == TypeCoinBuy.TRANSFER);

        // Get the last element and safely access its attributes
        const lastIncludedTransfer = includedTransfer.pop();

        if (!lastIncludedTransfer && !lastIncludedTransfer.attributes) {
            this.logger.error(`Transfer with this ${payload.data.attributes.tracking_id} not found`);
            throw new NotFoundException('Transfer is not complete');
        }

        if (lastIncludedTransfer.attributes.status < 0) {
            this.logger.error(`Transfer with this ${payload.data.attributes.tracking_id} track_id is rejected`);
            throw new HttpException('', HttpStatus.OK);
        } else if (lastIncludedTransfer.attributes.status < 2) {
            this.logger.warn(`Transfer with this ${payload.data.attributes.tracking_id} track_id is Unconfirmed`);
            throw new HttpException('', HttpStatus.OK);
        } else {
            this.logger.log(`Transfer with this ${payload.data.attributes.tracking_id} track_id is Confirmed`);
        }

        const transaction = await this.transactionService.checkExternalTrackNumber(payload.data.attributes.tracking_id);
        if (!transaction) {
            this.logger.error(`Transaction with this ${payload.data.attributes.tracking_id} track_number not found`);
            throw new NotFoundException('Transaction is not found');
        }

        const transactionStats = await this.transactionStatsService.findLastItem(transaction.id);
        if (!transactionStats) {
            this.logger.error(`Transaction status is not found, Transaction ID : ${transaction.id}`);
            throw new NotFoundException('Transaction status is not found');
        }

        await this.checkSignature(transaction, lastIncludedTransfer, payload.meta, payload.data.attributes.tracking_id);

        transaction.actualDepositAmount = parseFloat(lastIncludedTransfer.attributes.amount)
        transaction.requestDepositAmount = parseFloat(lastIncludedTransfer.attributes.amount)

        await this.transactionService.save(transaction)

        return transaction;

    }
}
