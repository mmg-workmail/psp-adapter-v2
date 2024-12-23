import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [ConfigsModule, DatabaseModule],
})
export class SharedModule { }
