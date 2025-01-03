import { Module } from '@nestjs/common';

import { SharedModule } from 'src/shared/shared.module';
import { HttpModule } from '@nestjs/axios';

import { GatewaysModule } from 'src/psp/modules/gateways/gateways.module';
import { MerchantModule } from 'src/psp/modules/merchant/merchant.module';
import { TransactionModule } from 'src/psp/modules/transaction/transaction.module';

import { TcPayController } from './controllers/tc-pay.controller';
import { TcPayGateway } from './services/tc-pay.gateway';



@Module({
    imports: [SharedModule, HttpModule, GatewaysModule, MerchantModule, TransactionModule],
    controllers: [TcPayController],
    providers: [TcPayGateway],
    exports: [TcPayGateway]
})
export class TcPayModule { }
