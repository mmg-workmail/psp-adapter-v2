import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BractagonOpenTransactionDto } from 'src/psp/modules/transaction/dto/eplanet/crm/bractagon/bractagon-open-transaction.dto';
import { BractagonGuard } from 'src/psp/modules/transaction/guards/eplanet/crm/bractagon/bractagon.guard';
import { BractagonResponseGeneratePaymentLink } from 'src/psp/modules/transaction/infrastructure/interfaces/eplanet/crm/bractagon/bractagon-response-generate-payment-link.interface';
import { BractagonService } from 'src/psp/modules/transaction/services/eplanet/crm/bractagon/bractagon.service';

@Controller('api/bractagon/transactions')
export class BractagonController {

    constructor(private readonly bractagonService: BractagonService) { }

    @UseGuards(BractagonGuard)
    @Post('tc-pay/open')
    create(@Body() bractagonOpenTransactionDto: BractagonOpenTransactionDto): Promise<BractagonResponseGeneratePaymentLink> {
        return this.bractagonService.openPayment(bractagonOpenTransactionDto);
    }

}
