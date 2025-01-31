import { CanActivate, ExecutionContext, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    console.log('Body:', request.body);       // Request Body
    console.log('Query:', request.query);     // Request Queury
    console.log('Params:', request.params);   // Request Params
    console.log('Headers:', request.headers); // Request Headers
    console.log('IP:', request.ip);           // Request Ip
    console.log('Method:', request.method);   // Request Method
    console.log('URL:', request.url);         // Request Url 

    if (!(request.body.data || request.body.included || request.body.meta)) {
      throw new NotFoundException('payload is empty', JSON.stringify(request.body));
    }

    // Transform the plain payload into a DTO instance
    const payload = plainToInstance(CoinBuyCallbackTransactionDto, request.body);

    this.logger.log('payload of CoinBuy callback', JSON.stringify(payload), JSON.stringify(request.body));

    const transaction = await this.coinBuyService.checkCallback(payload);

    // Adding data to the request object
    request.transaction = { ...transaction };

    return true;
  }



}
