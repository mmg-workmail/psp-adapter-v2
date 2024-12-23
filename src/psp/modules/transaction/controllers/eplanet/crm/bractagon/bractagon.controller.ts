import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BractagonOpenTransactionDto } from 'src/psp/modules/transaction/dto/eplanet/crm/bractagon/bractagon-open-transaction.dto';
import { BractagonGuard } from 'src/psp/modules/transaction/guards/eplanet/crm/bractagon/bractagon.guard';
import { BractagonService } from 'src/psp/modules/transaction/services/eplanet/crm/bractagon/bractagon.service';

@Controller('api/bractagon/transactions')
export class BractagonController {

    constructor(private readonly bractagonService: BractagonService) { }

    @UseGuards(BractagonGuard)
    @Post('tc-pay/open')
    create(@Body() bractagonOpenTransactionDto: BractagonOpenTransactionDto) {
        return this.bractagonService.openPayment(bractagonOpenTransactionDto);
    }

}
