import { Body, Controller, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { BractagonOpenTransactionDto } from 'src/psp/modules/crms/modules/bractagon/dto/bractagon-open-transaction.dto';
import { BractagonGuard } from 'src/psp/modules/crms/modules/bractagon/guards/bractagon.guard';
import { BractagonResponseGeneratePaymentLink } from 'src/psp/modules/crms/modules/bractagon/interfaces/bractagon-response-generate-payment-link.interface';
import { BractagonService } from 'src/psp/modules/crms/modules/bractagon/services/bractagon.service';
import { TcpayCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-callback-transaction.dto copy';
import { TcpayCallbackGuard } from 'src/psp/modules/payment-methods/modules/tc-pay/guards/tcpay-callback.guard';
import { NotFoundRedirectFilter } from 'src/shared/filters/exception-filter';
import { Response } from 'express';

@Controller('api/bractagon/transactions')
export class BractagonController {

    constructor(private readonly bractagonService: BractagonService) { }

    @UseGuards(BractagonGuard)
    @Post('tc-pay/open/pay/url')
    open(@Body() bractagonOpenTransactionDto: BractagonOpenTransactionDto): Promise<BractagonResponseGeneratePaymentLink> {
        return this.bractagonService.openPayment(bractagonOpenTransactionDto);
    }

    @UseFilters(NotFoundRedirectFilter)
    @Post('tc-pay/callback')
    @UseGuards(TcpayCallbackGuard)
    async callback(@Body() tcpayCallbackTransactionDto: TcpayCallbackTransactionDto, @Res() res: Response) {
        const result = await this.bractagonService.callbackPayment(tcpayCallbackTransactionDto);
        return res.redirect(result.url)
    }

}
