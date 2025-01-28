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

    // Transform the plain payload into a DTO instance
    const payload = plainToInstance(CoinBuyCallbackTransactionDto, request.body);

    this.logger.log('payload of CoinBuy callback', JSON.stringify(payload), JSON.stringify(request.body));

    console.log('Body:', request.body);       // داده‌های ارسالی در بدنه (POST/PUT)
    console.log('Query:', request.query);     // پارامترهای کوئری (GET)
    console.log('Params:', request.params);   // پارامترهای مسیر (Route Parameters)
    console.log('Headers:', request.headers); // هدرهای ارسال شده
    console.log('IP:', request.ip);           // آی‌پی کاربر
    console.log('Method:', request.method);   // نوع درخواست (GET, POST, PUT, DELETE)
    console.log('URL:', request.url);         // URL درخواست    


    const transaction = await this.coinBuyService.checkCallback(payload);

    // Adding data to the request object
    request.transaction = { ...transaction };

    return true;
  }



}
