import { PaymentGateway } from './payment-gateway.interface';

export abstract class AbstractPaymentGateway implements PaymentGateway {
    abstract processPayment(amount: number): string;

    logTransaction(amount: number, gatewayName: string): void {
        console.log(`Transaction logged: $${amount} via ${gatewayName}`);
    }

    validateAmount(amount: number): boolean {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        return true;
    }
}
