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
import { GatewayRegistry } from './infrastructure/factories/gateway-registry';
import { TcPayGateway } from './infrastructure/gateways/tc-pay.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionStats]), HttpModule, GatewaysModule, MerchantModule],
  controllers: [TcPayController, BractagonController],
  providers: [
    TransactionService, TransactionStatsService, PaymentService,
    GatewayFactory, GatewayRegistry,
    TcPayGateway,
    BractagonService
  ],
})
export class TransactionModule { }
