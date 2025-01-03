import { IsString, IsNotEmpty, IsEnum, ValidateNested } from "class-validator";
export class TcpayCallbackTransactionDto {

    @IsNotEmpty({})
    resCode: string;

    @IsString()
    description: string;

    @IsNotEmpty({})
    'data.Action': number;

    @IsNotEmpty({})
    'data.Amount': string;

    @IsString()
    @IsNotEmpty({})
    'data.InvoiceNumber': string;

    @IsString()
    @IsNotEmpty({})
    'data.MerchantId': string;

    @IsString()
    @IsNotEmpty({})
    'data.TerminalId': string;

    @IsString()
    @IsNotEmpty({})
    'data.Token': string;

}
