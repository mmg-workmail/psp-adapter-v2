import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { GatewayType } from '../enums/gateway-type';
import { PaymentGateway } from './payment-gateway.interface';
import { Transaction } from '../../entities/transaction.entity';
import { TransactionStats } from '../../entities/transaction-stats.entity';
import ResponseGeneratePaymentLink from '../interfaces/ResponseGeneratePaymentLink';

export abstract class AbstractPaymentGateway implements PaymentGateway {

    protected gatewayType: GatewayType;

    protected token: string;
    protected hasAuthenticated: boolean = false;

    protected gateway: Gateway;
    protected transaction: Transaction;
    protected transactionStats: TransactionStats;

    public setGateway(gateway: Gateway): PaymentGateway {
        this.gateway = gateway;
        return this;
    }
    public setTransaction(transaction: Transaction): PaymentGateway {
        this.transaction = transaction;
        return this;
    }
    public setTransactionStats(transactionStats: TransactionStats): PaymentGateway {
        this.transactionStats = transactionStats;
        return this;
    }

    public isAuthenticated(): boolean {
        return this.hasAuthenticated;
    }

    abstract generatePaymentLink(): Promise<ResponseGeneratePaymentLink>;

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
