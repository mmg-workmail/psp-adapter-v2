import { Currency } from "src/psp/enums/currency";

export class CreateMerchantDto {
    name: string;
    merchantId: string;
    callbackUrl: string;
    token: string;
    currency: Currency;
}
