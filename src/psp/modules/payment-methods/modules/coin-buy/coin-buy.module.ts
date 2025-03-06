import { Module } from '@nestjs/common';
import { CoinBuyService } from './services/coin-buy/coin-buy.service';

import { HttpModule } from '@nestjs/axios';

import { GatewaysModule } from 'src/psp/modules/gateways/gateways.module';
import { MerchantModule } from 'src/psp/modules/merchant/merchant.module';
import { TransactionModule } from 'src/psp/modules/transaction/transaction.module';
import { SharedModule } from 'src/shared/shared.module';
import { RateController } from './controllers/rate/rate.controller';

@Module({
  imports: [
    GatewaysModule, MerchantModule, TransactionModule,
    HttpModule, SharedModule
  ],
  providers: [CoinBuyService],
  exports: [CoinBuyService],
  controllers: [RateController]
})
export class CoinBuyModule { }
