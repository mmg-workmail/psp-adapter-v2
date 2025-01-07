import { Gateway } from 'src/psp/modules/gateways/entities/gateway.entity';
import { GatewayType } from '../../enums/gateway-type';
import { PaymentGateway } from './payment-gateway.interface';
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';

export abstract class AbstractPaymentGateway implements PaymentGateway {

    protected gatewayType: GatewayType;
    abstract generatePaymentLink(transaction: Transaction, gateway: Gateway);

}
