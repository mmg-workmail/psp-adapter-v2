import { TypeCoinBuy } from "../enums/typeCoinBuy"

export interface ResponseCoinBuy<AttributesType, RelationshipsType = Record<string, any>> {
    data: {
        type: TypeCoinBuy,
        id: number,
        attributes: AttributesType,
        relationships?: RelationshipsType
    },
    meta?: {
        time: string,
        sign: string
    }
}
export interface ResponseCoinBuyToken {
    refresh: string,
    access: string,
    access_expired_at: string,
    refresh_expired_at: string,
    is_2fa_confirmed: boolean
}
export interface ResponseCoinBuyRefreshToken {
    refresh: string,
    access: string,
    access_expired_at: string,
    refresh_expired_at: string,
    is_2fa_confirmed: false
}

export interface ResponseCoinBuyDeposit {
    status: number,
    address: null | string,
    address_type: string,
    label: string,
    tracking_id: string,
    confirmations_needed: number | null,
    time_limit: null,
    callback_url: string,
    inaccuracy: number,
    target_amount_requested: null,
    rate_requested: null,
    rate_expired_at: null,
    invoice_updated_at: null,
    payment_page: string,
    target_paid: number,
    source_amount_requested: number,
    target_paid_pending: number,
    assets: Record<string, any>,
    destination: null,
    payment_page_redirect_url: string,
    payment_page_button_text: string,
    is_active: boolean
}
export interface ResponseCoinBuyRelationships {
    currency: { data: null },
    wallet: {
        data: {
            type: TypeCoinBuy.WALLET,
            id: number
        }
    }
}

export enum CoinBuyDepositStatus {
    'CREATED' = 2,
    'PAID' = 3,
    'CANCELED' = 4,
    'UNRESOLVED' = 5,
}