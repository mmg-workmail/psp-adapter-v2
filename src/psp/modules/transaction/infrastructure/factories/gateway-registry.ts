import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../abstracts/payment-gateway.interface';
import { GatewayType } from '../enums/gateway-type';

@Injectable()
export class GatewayRegistry {
    private gateways = new Map<GatewayType, PaymentGateway>();

    register(gatewayType: GatewayType, gateway: PaymentGateway): void {
        this.gateways.set(gatewayType, gateway);
    }

    getGateway(gatewayType: GatewayType): PaymentGateway {
        const gateway = this.gateways.get(gatewayType);
        if (!gateway) {
            throw new Error(`Unsupported payment gateway: ${gatewayType}`);
        }
        return gateway;
    }
}
