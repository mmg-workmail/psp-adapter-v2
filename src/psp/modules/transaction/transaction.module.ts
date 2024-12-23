import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { GatewaysModule } from '../gateways/gateways.module';
import { TransactionStats } from './entities/transaction-stats.entity';
import { MerchantModule } from '../merchant/merchant.module';

import { PaymentService } from './infrastructure/services/payment.service';
import { GatewayFactory } from './infrastructure/factories/gateway.factory';
import { TcPayController } from './controllers/payments/tc-pay/tc-pay.controller';
import { BractagonService } from './services/eplanet/crm/bractagon/bractagon.service';
import { BractagonController } from './controllers/eplanet/crm/bractagon/bractagon.controller';
import { TransactionStatsService } from './services/db/transaction-stats/transaction-stats.service';
import { TransactionService } from './services/db/transaction/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionStats]), GatewaysModule, MerchantModule],
  controllers: [TcPayController, BractagonController],
  providers: [TransactionService, PaymentService, GatewayFactory, BractagonService, TransactionStatsService],
})
export class TransactionModule { }
