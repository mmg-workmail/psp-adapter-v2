import { TypeCoinBuy } from "../enums/typeCoinBuy"

export interface RequestCoinBuy<AttributesType, RelationshipsType = Record<string, any>> {
    data: {
        type: TypeCoinBuy,
        attributes: AttributesType
        relationships?: RelationshipsType
    }
}
export interface RequestCoinBuyLogin {
    login: string,
    password: string
}
export interface RequestCoinBuyRefreshToken {
    refresh: string,
}

export interface RequestCoinBuyDeposit {
    label: string,
    tracking_id: string,
    confirmations_needed: number | null,
    callback_url: string,
    payment_page_redirect_url: string,
    payment_page_button_text: string
}
export interface RequestCoinBuyRelationships {
    currency?: {
        data: {
            type: TypeCoinBuy.CURRENCY,
            id: string
        }
    },
    wallet: {
        data: {
            type: TypeCoinBuy.WALLET,
            id: string
        }
    }
}
