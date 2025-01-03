import { Module } from '@nestjs/common';

import { GatewaysModule } from './modules/gateways/gateways.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { TransactionModule } from './modules/transaction/transaction.module';

import { CrmsModule } from './modules/crms/crms.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';

@Module({
    imports: [
        GatewaysModule, MerchantModule, TransactionModule,
        CrmsModule, PaymentMethodsModule
    ],
})
export class PspModule { }
