import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from './entities/transaction.entity';
import { TransactionStats } from './entities/transaction-stats.entity';

import { GatewaysModule } from '../gateways/gateways.module';
import { MerchantModule } from '../merchant/merchant.module';

import { TransactionStatsService } from './services/transaction-stats/transaction-stats.service';
import { TransactionService } from './services/transaction/transaction.service';




@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionStats]), GatewaysModule, MerchantModule],
  providers: [TransactionService, TransactionStatsService],
  exports: [TransactionService, TransactionStatsService],
})
export class TransactionModule { }
