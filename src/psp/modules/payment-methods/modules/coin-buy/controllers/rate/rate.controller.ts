import { Controller, Get, Param } from '@nestjs/common';
import { CoinBuyService } from '../../services/coin-buy/coin-buy.service';


@Controller('api/psp/payment-methods/coin-buy/rates')
export class RateController {

    constructor(private readonly coinBuyService: CoinBuyService) { }

    @Get(':currency')
    async getRate(@Param('currency') currency: string) {
        return this.coinBuyService.getRate(currency);
    }

}
