import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './database/database.module';
import { CryptoRsaService } from './services/crypto-rsa/crypto-rsa.service';

@Module({
    imports: [ConfigsModule, DatabaseModule],
    providers: [CryptoRsaService],
    exports: [CryptoRsaService],
})
export class SharedModule { }
