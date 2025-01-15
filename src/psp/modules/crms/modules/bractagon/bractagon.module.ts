import { Module } from '@nestjs/common';

import { GatewaysModule } from 'src/psp/modules/gateways/gateways.module';
import { MerchantModule } from 'src/psp/modules/merchant/merchant.module';
import { TransactionModule } from 'src/psp/modules/transaction/transaction.module';

import { TcPayModule } from 'src/psp/modules/payment-methods/modules/tc-pay/tcp-pay.module';

import { BractagonController } from './controllers/bractagon.controller';
import { BractagonService } from './services/bractagon.service';
import { HttpModule } from '@nestjs/axios';
import { CoinBuyModule } from 'src/psp/modules/payment-methods/modules/coin-buy/coin-buy.module';


@Module({
    imports: [
        HttpModule,
        GatewaysModule, MerchantModule, TransactionModule,
        TcPayModule, CoinBuyModule
    ],
    controllers: [BractagonController],
    providers: [BractagonService],
    exports: [BractagonService]
})
export class BractagonModule { }
