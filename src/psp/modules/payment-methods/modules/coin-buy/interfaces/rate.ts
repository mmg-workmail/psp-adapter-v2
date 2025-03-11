export interface Rate {
    data: RateCurrency[],
    meta: {
        server_time: string
    }
}

export interface RateCurrency {
    type: string,
    id: string,
    attributes: {
        left: string,
        right: string,
        bid: string,
        ask: string,
        exp: number,
        expired_at: Date,
        created_at: Date
    }
}

