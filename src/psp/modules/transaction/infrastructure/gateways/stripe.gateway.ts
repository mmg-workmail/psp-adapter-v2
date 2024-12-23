import { AbstractPaymentGateway } from '../abstracts/payment-gateway.abstract';

export class StripeGateway extends AbstractPaymentGateway {
    processPayment(amount: number): string {
        this.validateAmount(amount); // Use shared functionality
        this.logTransaction(amount, 'Stripe'); // Use shared functionality
        return `Stripe payment processed: $${amount}`;
    }
}
