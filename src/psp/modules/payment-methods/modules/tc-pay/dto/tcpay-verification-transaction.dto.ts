import { Type } from "class-transformer";
import { IsString, IsNotEmpty, ValidateNested } from "class-validator";

class TcpayVerificationDataTransactionDto {
    @IsNotEmpty({})
    'action': number;

    @IsNotEmpty({})
    'amount': number;

    @IsString()
    @IsNotEmpty({})
    'invoiceNumber': string;

    @IsString()
    @IsNotEmpty({})
    'merchantId': string;

    @IsString()
    @IsNotEmpty({})
    'terminalId': string;

    @IsString()
    @IsNotEmpty({})
    'token': string;

    'transactionId': string;

    'wallet': string;
}

export class TcpayVerificationTransactionDto {

    @IsNotEmpty({})
    resCode: string;

    @IsString()
    description: string;

    @ValidateNested()
    @Type(() => TcpayVerificationDataTransactionDto)
    data: TcpayVerificationDataTransactionDto;

}
