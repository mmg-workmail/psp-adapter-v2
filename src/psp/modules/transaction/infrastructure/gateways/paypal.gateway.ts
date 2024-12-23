import { AbstractPaymentGateway } from '../abstracts/payment-gateway.abstract';

export class PayPalGateway extends AbstractPaymentGateway {
    processPayment(amount: number): string {
        this.validateAmount(amount); // Use shared functionality
        this.logTransaction(amount, 'PayPal'); // Use shared functionality
        return `PayPal payment processed: $${amount}`;
    }
}
