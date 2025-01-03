import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { BractagonService } from '../../../../crms/modules/bractagon/services/bractagon.service';

@Controller('api/callback/transactions/tc-pay')
export class TcPayController {

    constructor() { }


    @Post('/irt')
    create(@Body() tcPay) {
        console.log(tcPay);
        return true
    }
}
