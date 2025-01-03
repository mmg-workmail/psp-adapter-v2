import { Currency } from "src/psp/enums/currency";
import { Merchant } from "src/psp/modules/merchant/entities/merchant.entity";

export class CreateTransactionDto {
    username: string;
    userId: string;
    orderId: string;
    externalOrderId: string;
    externalTrackNumber: string;
    amount: number;
    actualDepositAmount: number;
    requestDepositAmount: number;
    exchangeValue: number;
    currency: Currency;
    merchant: Merchant;


    constructor(partial?: Partial<CreateTransactionDto>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
