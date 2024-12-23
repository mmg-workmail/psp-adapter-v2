import { Currency } from "src/psp/enums/currency";
import { GatewayType } from "../../transaction/infrastructure/enums/gateway-type";

export class CreateGatewayDto {
    name: string;
    encodedConfig: Record<string, any>;  // This is an object
    merchantId: number;
    currencyDeposit: Currency;
    currencyExchange: Currency;
    type: GatewayType;
}
