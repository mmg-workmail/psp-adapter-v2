export interface CoinBuyEncodedConfig {
    baseUrl: string,
    paymentRequest: string,
    paymentVerification: string,
    authToken: string,
    authTokenRefresh: string,
    login: string,
    password: string,

    walletId: string,
    callbackUrl: string,
    paymentPageRedirectUrl: string,
    paymentPageButtonText: string,

    currencies: { [key: string]: string }

}

