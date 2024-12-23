import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Signature } from 'src/shared/classes/signature/signature';


import { plainToInstance } from 'class-transformer';
import { MerchantService } from 'src/psp/modules/merchant/merchant.service';
import { BractagonOpenTransactionDto } from 'src/psp/modules/transaction/dto/eplanet/crm/bractagon/bractagon-open-transaction.dto';

@Injectable()
export class BractagonGuard implements CanActivate {

  constructor(private readonly merchantService: MerchantService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();

    // Transform the plain payload into a DTO instance
    const payload = plainToInstance(BractagonOpenTransactionDto, request.body);

    const merchant = await this.merchantService.findOneByMerchantId(payload.merchant_id);

    if (!merchant) {
      throw new UnauthorizedException('Merchant not found');
    }

    const sign = new Signature(merchant.token);

    // Validate the signature
    const signature = payload.sign
    delete payload.sign;

    if (!sign.isValid(payload, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }
    return true;
  }
}
