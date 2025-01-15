import { Module } from '@nestjs/common';

import { TcPayModule } from 'src/psp//modules/payment-methods/modules/tc-pay/tcp-pay.module';
import { CoinBuyModule } from './modules/coin-buy/coin-buy.module';

@Module({
    imports: [TcPayModule, CoinBuyModule]
})
export class PaymentMethodsModule { }
