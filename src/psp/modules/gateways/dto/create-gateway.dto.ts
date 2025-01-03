import { Currency } from "src/psp/enums/currency";
import { GatewayType } from "../../payment-methods/enums/gateway-type";

export class CreateGatewayDto {
    name: string;
    encodedConfig: Record<string, any>;  // This is an object
    merchantId: number;
    currencyDeposit: Currency;
    currencyExchange: Currency;
    type: GatewayType;
}
