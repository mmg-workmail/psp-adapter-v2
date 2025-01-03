import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { Currency } from "src/psp/enums/currency";

export class BractagonOpenTransactionDto {

    @IsString()
    @IsNotEmpty({ message: 'merchant_id is required' })
    merchant_id: string;


    @IsNotEmpty({ message: 'amount is required' })
    amount: number;

    @IsEnum(Currency, { message: 'Invalid currency value' })
    @IsNotEmpty({ message: 'currency is required' })
    currency: Currency;

    @IsString()
    @IsNotEmpty({ message: 'order_no is required' })
    order_no: string;

    @IsString()
    @IsNotEmpty({ message: 'user_id is required' })
    user_id: string;

    @IsString()
    @IsNotEmpty({ message: 'user_name is required' })
    user_name: string;

    @IsString()
    @IsNotEmpty({ message: 'language is required' })
    language: string;

    @IsString()
    @IsNotEmpty({ message: 'sign is required' })
    sign: string;
}
