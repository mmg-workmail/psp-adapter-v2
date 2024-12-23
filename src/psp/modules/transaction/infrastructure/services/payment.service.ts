import { Injectable } from '@nestjs/common';
import { GatewayFactory } from '../factories/gateway.factory';
import { GatewayType } from '../enums/gateway-type';
import { PaymentGateway } from '../abstracts/payment-gateway.interface';

@Injectable()
export class PaymentService {
    constructor(private readonly gatewayFactory: GatewayFactory) { }
    processPayment(gatewayType: GatewayType): PaymentGateway {
        return this.gatewayFactory.createGateway(gatewayType);
    }
}
