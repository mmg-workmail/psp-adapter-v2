import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Signature } from 'src/shared/classes/signature/signature';


import { plainToInstance } from 'class-transformer';
import { MerchantService } from 'src/psp/modules/merchant/merchant.service';
import { BractagonOpenTransactionDto } from 'src/psp/modules/crms/modules/bractagon/dto/bractagon-open-transaction.dto';
import { stringify } from 'querystring';
import { json } from 'stream/consumers';

@Injectable()
export class BractagonGuard implements CanActivate {

  private readonly logger = new Logger(BractagonGuard.name, { timestamp: true });

  constructor(private readonly merchantService: MerchantService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();

    // Transform the plain payload into a DTO instance
    const payload = plainToInstance(BractagonOpenTransactionDto, request.body);

    this.logger.log("Payload : ", JSON.stringify(payload));

    const merchant = await this.merchantService.findOneByMerchantId(payload.merchant_id);

    if (!merchant) {
      this.logger.error('Merchant not found', payload.merchant_id);
      throw new UnauthorizedException('Merchant not found');
    }

    const sign = new Signature(merchant.token);

    // Validate the signature
    const signature = payload.sign
    delete payload.sign;

    if (!sign.isValid(payload, signature)) {
      this.logger.error('Invalid signature', payload);
      throw new UnauthorizedException('Invalid signature');
    } else {
      this.logger.log('bractagon signature is valid');
    }
    return true;
  }
}
