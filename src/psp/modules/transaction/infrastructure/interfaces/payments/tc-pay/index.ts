export interface tcPayEncodedConfig {
    baseUrl: string,
    paymentRequest: string,
    merchantId: string,
    terminalId: string,
    returnUrl: string
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