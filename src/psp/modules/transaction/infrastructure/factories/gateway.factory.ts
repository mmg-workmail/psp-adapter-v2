import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../abstracts/payment-gateway.interface';
import { GatewayType } from '../enums/gateway-type';
import { GatewayRegistry } from './gateway-registry';

@Injectable()
export class GatewayFactory {
    constructor(private readonly gatewayRegistry: GatewayRegistry) { }

    createGateway(gatewayType: GatewayType): PaymentGateway {
        return this.gatewayRegistry.getGateway(gatewayType);
    }
}