import { Body, Controller, Get, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { BractagonOpenTransactionDto } from 'src/psp/modules/crms/modules/bractagon/dto/bractagon-open-transaction.dto';
import { BractagonGuard } from 'src/psp/modules/crms/modules/bractagon/guards/bractagon.guard';
import { BractagonResponseGeneratePaymentLink } from 'src/psp/modules/crms/modules/bractagon/interfaces/bractagon-response-generate-payment-link.interface';
import { BractagonService } from 'src/psp/modules/crms/modules/bractagon/services/bractagon.service';
import { TcpayCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-callback-transaction.dto';
import { TcpayCallbackGuard } from 'src/psp/modules/payment-methods/modules/tc-pay/guards/tcpay-callback.guard';
import { Response } from 'express';
import { CoinBuyCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/coin-buy/dto/coinbuy-callback-transaction.dto';
import { CoinBuyGuard } from 'src/psp/modules/payment-methods/modules/coin-buy/guards/coin-buy/coin-buy.guard';
import { CustomRequest } from 'src/psp/modules/payment-methods/interfaces/cutom-request';

@Controller('api/bractagon/transactions')
export class BractagonController {

    constructor(private readonly bractagonService: BractagonService) { }

    @UseGuards(BractagonGuard)
    @Post('tc-pay/open/pay/url')
    openTcPay(@Body() bractagonOpenTransactionDto: BractagonOpenTransactionDto): Promise<BractagonResponseGeneratePaymentLink> {
        return this.bractagonService.openPayment(bractagonOpenTransactionDto);
    }

    @Post('tc-pay/callback')
    @UseGuards(TcpayCallbackGuard)
    async callbackTcPay(@Res() res: Response, @Req() req: CustomRequest) {
        return await this.bractagonService.callbackPayment(req.transaction);
    }

    @UseGuards(BractagonGuard)
    @Post('coin-buy/open/pay/url')
    openCoinBuy(@Body() bractagonOpenTransactionDto: BractagonOpenTransactionDto): Promise<BractagonResponseGeneratePaymentLink> {
        return this.bractagonService.openPayment(bractagonOpenTransactionDto);
    }

    @Post('coin-buy/callback')
    @UseGuards(CoinBuyGuard)
    async callbackCoinBuy(@Res() res: Response, @Req() req: CustomRequest) {
        return await this.bractagonService.callbackPayment(req.transaction);
    }

}
