import { Module } from '@nestjs/common';
import { GatewaysModule } from './modules/gateways/gateways.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
    imports: [GatewaysModule, MerchantModule, TransactionModule],
})
export class PspModule { }
