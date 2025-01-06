import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundException)
export class NotFoundRedirectFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.redirect('https://landing.eplanetbrokers.com/payments/error'); // Redirect to the desired URL
  }
}
