import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BractagonGuard } from '../../../guards/eplanet/crm/bractagon/bractagon.guard';
import { BractagonOpenTransactionDto } from '../../../dto/eplanet/crm/bractagon/bractagon-open-transaction.dto';
import { BractagonService } from '../../../services/eplanet/crm/bractagon/bractagon.service';

@Controller('api/transactions/tc-pay')
export class TcPayController {

    constructor(private readonly bractagonService: BractagonService) { }

    @UseGuards(BractagonGuard)
    @Post('callback/payment')
    create(@Body() bractagonOpenTransactionDto: BractagonOpenTransactionDto) {
        return this.bractagonService.openPayment(bractagonOpenTransactionDto);
    }
}
