import { Controller, Get } from '@nestjs/common';
import { CoinBuyService } from '../../services/coin-buy/coin-buy.service';

@Controller('api/psp/payment-methods/coin-buy/rates')
export class RateController {

    constructor(private readonly coinBuyService: CoinBuyService) { }

    @Get('USDT')
    async getRateUsdt() {
        return await this.coinBuyService.getRate();
    }

}
