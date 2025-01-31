import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // Strip unwanted properties
      // forbidNonWhitelisted: false, // Throw error on unwanted properties
      // transform: false, // Automatically transform payloads to DTOs
    }),
  );

  // Ensure NestJS parses application/vnd.api+json as JSON
  app.use(express.json({ type: ['application/vnd.api+json', 'application/json'] }));

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
