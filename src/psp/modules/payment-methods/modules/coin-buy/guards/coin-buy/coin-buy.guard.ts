import { CanActivate, ExecutionContext, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';


import { plainToInstance } from 'class-transformer';

import { TransactionService } from 'src/psp/modules/transaction/services/transaction/transaction.service';
import { TransactionStatsService } from 'src/psp/modules/transaction/services/transaction-stats/transaction-stats.service';
import { GatewaysService } from 'src/psp/modules/gateways/gateways.service';
import { CoinBuyCallbackTransactionDto, IncludedTransferDto, TransferAttributesDto } from 'src/psp/modules/payment-methods/modules/coin-buy/dto/coinbuy-callback-transaction.dto';
import { TransactionStatus } from 'src/psp/enums/TransactionStatus';
import { CreateTransactionStatsDto } from 'src/psp/modules/transaction/dto/create-transaction-stats.dto';
import { CoinBuyEncodedConfig } from '../../interfaces';
import { Transaction } from 'src/psp/modules/transaction/entities/transaction.entity';
import { SignatureForCoinBuy } from '../../classes/signature/signature';
import { TypeCoinBuy } from '../../enums/typeCoinBuy';

@Injectable()
export class CoinBuyGuard implements CanActivate {

  private readonly logger = new Logger(CoinBuyGuard.name, { timestamp: true });
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionStatsService: TransactionStatsService,
    private readonly gatewaysService: GatewaysService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();

    // Transform the plain payload into a DTO instance
    const payload = plainToInstance(CoinBuyCallbackTransactionDto, request.body);

    this.logger.log('payload', JSON.stringify(payload));

    const transaction = await this.transactionService.checkExternalTrackNumber(payload.data.attributes.tracking_id);
    if (!transaction) {
      this.logger.error(`Transaction with this ${payload.data.attributes.tracking_id} not found`);
      throw new NotFoundException('Transaction is not found');
    }

    const transactionStats = await this.transactionStatsService.findLastItem(transaction.id);
    if (!transactionStats) {
      this.logger.error(`Transaction status is not found, Transaction ID : ${transaction.id}`);
      throw new NotFoundException('Transaction status is not found');
    }

    const result = await this.checkSignature(transaction, payload);

    return result;
  }

  async checkSignature(transaction: Transaction, coinBuyCallbackTransactionDto: CoinBuyCallbackTransactionDto): Promise<boolean> {
    let result = true;
    // Store Start Transaction Stats
    const getStartTransactionStatDto = new CreateTransactionStatsDto({
      status: TransactionStatus.AUTHENTICATION_START,
      transaction: transaction
    });
    await this.transactionStatsService.create(getStartTransactionStatDto);

    const payload = { ...coinBuyCallbackTransactionDto };

    const callbackSign = payload.meta.sign;
    const callbackTime = payload.meta.time;

    // Filter the included array for items of type 'transfer'
    const includedTransfer = payload.included.filter(item => item.type == TypeCoinBuy.TRANSFER);

    // Get the last element and safely access its attributes
    const lastIncludedTransfer = includedTransfer.pop();

    if (!lastIncludedTransfer && !lastIncludedTransfer.attributes) {
      this.logger.error(`Transfer with this ${payload.data.attributes.tracking_id} not found`);
      throw new NotFoundException('Transfer is not found');
    }

    const deposit = payload.data.attributes;

    let status: number, amount: string;

    status = lastIncludedTransfer.attributes.status;
    amount = lastIncludedTransfer.attributes.amount;

    const tracking_id = deposit.tracking_id;

    // prepare data for hash check
    const message = status + amount + tracking_id + callbackTime;

    const gateway = await this.gatewaysService.findOneByMerchantId(transaction.merchant.merchantId);
    const coinBuyEncodedConfig = gateway.encodedConfig as CoinBuyEncodedConfig;
    const coinBuyLoggin = coinBuyEncodedConfig.login;
    const coinBuyPassword = coinBuyEncodedConfig.password;

    const sign = new SignatureForCoinBuy();
    const isValid = sign.isValid(callbackSign, message, coinBuyLoggin, coinBuyPassword);

    if (!isValid) {

      // Store Error Transaction Stats
      const getErrorTransactionStatDto = new CreateTransactionStatsDto({
        status: TransactionStatus.AUTHENTICATION_ERROR,
        transaction: transaction
      });
      await this.transactionStatsService.create(getErrorTransactionStatDto);

      this.logger.error(`Signature is not valid`);
      result = false;
    } else {
      // Store Approved Transaction Stats
      const getApprovedTransactionStatDto = new CreateTransactionStatsDto({
        status: TransactionStatus.AUTHENTICATION_APPROVED,
        transaction: transaction
      });
      await this.transactionStatsService.create(getApprovedTransactionStatDto);
    }

    return result;

  }

}
