import { Gateway } from "src/psp/modules/gateways/entities/gateway.entity";
import { Transaction } from "../../entities/transaction.entity";
import { TransactionStats } from "../../entities/transaction-stats.entity";
import ResponseGeneratePaymentLink from "../interfaces/ResponseGeneratePaymentLink";

export interface PaymentGateway {

    setGateway(gateway: Gateway): PaymentGateway;
    setTransaction(transaction: Transaction): PaymentGateway;
    setTransactionStats(transactionStats: TransactionStats): PaymentGateway;

    generatePaymentLink(): Promise<ResponseGeneratePaymentLink>

    processPayment(amount: number): string;
}