import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../abstracts/payment-gateway.interface';
import { StripeGateway } from '../gateways/stripe.gateway';
import { PayPalGateway } from '../gateways/paypal.gateway';
import { TcPayGateway } from '../gateways/tc-pay.gateway';
import { GatewayType } from '../enums/gateway-type';

@Injectable()
export class GatewayFactory {
    createGateway(gatewayType: GatewayType): PaymentGateway {
        switch (gatewayType) {
            case GatewayType.TC_PAY:
                return new TcPayGateway();
            case GatewayType.STRIPE:
                return new StripeGateway();
            case GatewayType.PAYPAL:
                return new PayPalGateway();
            default:
                throw new Error(`Unsupported payment gateway: ${gatewayType}`);
        }
    }
}
