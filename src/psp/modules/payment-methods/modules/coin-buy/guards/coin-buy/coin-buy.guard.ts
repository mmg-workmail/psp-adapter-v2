import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CoinBuyCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/coin-buy/dto/coinbuy-callback-transaction.dto';
import { CustomRequest } from 'src/psp/modules/payment-methods/interfaces/cutom-request';

import { CoinBuyService } from '../../services/coin-buy/coin-buy.service';

@Injectable()
export class CoinBuyGuard implements CanActivate {

  private readonly logger = new Logger(CoinBuyGuard.name, { timestamp: true });

  constructor(
    private readonly coinBuyService: CoinBuyService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest<CustomRequest>();

    // Transform the plain payload into a DTO instance
    const payload = plainToInstance(CoinBuyCallbackTransactionDto, request.body);

    this.logger.log('payload of CoinBuy callback', JSON.stringify(payload));

    const transaction = await this.coinBuyService.checkCallback(payload);

    // Adding data to the request object
    request.transaction = { ...transaction };

    return true;
  }



}
