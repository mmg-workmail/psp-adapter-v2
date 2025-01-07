export interface TcPayEncodedConfig {
    baseUrl: string,
    paymentRequest: string,
    paymentVerification: string,
    merchantId: string,
    terminalId: string,
    approveUrl: string,
    returnUrl: string,
    generateSignUrl: string,
    generateSignVerify: string,
    generateLinkPayment: string,
    privateKeyXml: string,
}

export interface tcPayResponse {
    success: boolean,
    resCode: number,
    description: string,
    data: any | null,
}

export enum Action {
    DEPOSIT = 50,
    WITHDRAW = 100
}

export interface ResponseGeneratePaymentLink {
    url: string
}