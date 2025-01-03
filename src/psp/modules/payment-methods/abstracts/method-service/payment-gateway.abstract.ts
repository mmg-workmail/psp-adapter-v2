import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { GatewayType } from '../../enums/gateway-type';
import { PaymentGateway } from './payment-gateway.interface';
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { TransactionStats } from 'src/psp/modules/transaction/entities/transaction-stats.entity';

export abstract class AbstractPaymentGateway implements PaymentGateway {

    protected gatewayType: GatewayType;

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

    abstract generatePaymentLink();

}
