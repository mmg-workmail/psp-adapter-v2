import { IsString, IsNotEmpty, IsEnum, IsNumber } from "class-validator";
import { Currency } from "src/psp/enums/currency";



export class BractagonCallbackTransactionDto {

    @IsString()
    @IsNotEmpty()
    merchant_id: string;

    @IsString()
    @IsNotEmpty()
    order_no: string;

    @IsString()
    transaction_id?: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsEnum(Currency)
    @IsNotEmpty()
    currency: Currency;

    @IsNotEmpty()
    time: number;

    @IsString()
    user_id?: string;

    @IsNumber()
    @IsNotEmpty()
    status: number;

    @IsString()
    sign?: string;
}