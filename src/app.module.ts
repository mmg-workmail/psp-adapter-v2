import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';

import { PspModule } from './psp/psp.module';

@Module({
  imports: [SharedModule, PspModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
