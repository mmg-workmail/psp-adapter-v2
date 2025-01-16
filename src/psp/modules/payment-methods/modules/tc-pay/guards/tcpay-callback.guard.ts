import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { TcpayCallbackTransactionDto } from 'src/psp/modules/payment-methods/modules/tc-pay/dto/tcpay-callback-transaction.dto';
import { CustomRequest } from '../../../interfaces/cutom-request';

import { TcPayGateway } from '../services/tc-pay.gateway';

@Injectable()
export class TcpayCallbackGuard implements CanActivate {

    private readonly logger = new Logger(TcpayCallbackGuard.name, { timestamp: true });
    constructor(
        private readonly tcPayGateway: TcPayGateway,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request = context.switchToHttp().getRequest<CustomRequest>();

        // Transform the plain payload into a DTO instance
        const payload = plainToInstance(TcpayCallbackTransactionDto, request.body);
        this.logger.log('payload of TcPay callback', JSON.stringify(payload));

        const transaction = await this.tcPayGateway.checkCallback(payload);

        // Adding data to the request object
        request.transaction = { ...transaction };

        return true;
    }



}
