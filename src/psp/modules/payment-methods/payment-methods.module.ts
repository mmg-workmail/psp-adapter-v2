import { Module } from '@nestjs/common';

import { TcPayModule } from 'src/psp//modules/payment-methods/modules/tc-pay/tcp-pay.module';

@Module({
    imports: [TcPayModule]
})
export class PaymentMethodsModule { }
