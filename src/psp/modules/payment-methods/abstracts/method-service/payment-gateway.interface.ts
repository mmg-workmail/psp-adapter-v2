import { Gateway } from "src/psp/modules/gateways/entities/gateway.entity";
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { TransactionStats } from 'src/psp/modules/transaction/entities/transaction-stats.entity';

export interface PaymentGateway {

    setGateway(gateway: Gateway): PaymentGateway;
    setTransaction(transaction: Transaction): PaymentGateway;
    setTransactionStats(transactionStats: TransactionStats): PaymentGateway;

    generatePaymentLink()

}