import { Gateway } from "src/psp/modules/gateways/entities/gateway.entity";
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';

export interface PaymentGateway {

    generatePaymentLink(transaction: Transaction, gateway: Gateway,)

}