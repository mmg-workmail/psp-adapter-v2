
import { AbstractPaymentGateway } from '../abstracts/payment-gateway.abstract';
import { GatewayType } from '../enums/gateway-type';

export class TcPayGateway extends AbstractPaymentGateway {

    protected type = GatewayType.TC_PAY;



    processPayment(amount: number): string {
        this.validateAmount(amount); // Use shared functionality
        this.logTransaction(amount, 'Stripe'); // Use shared functionality
        return `Stripe payment processed: $${amount}`;
    }
}
