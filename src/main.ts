import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // Strip unwanted properties
      // forbidNonWhitelisted: false, // Throw error on unwanted properties
      // transform: false, // Automatically transform payloads to DTOs
    }),
  );

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
