export interface PaymentGateway {
    processPayment(amount: number): string;
}