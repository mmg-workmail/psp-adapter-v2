import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './database/database.module';
import { CryptoRsaService } from './services/crypto-rsa/crypto-rsa.service';
import { GenerateCodeService } from './services/generate-code/generate-code.service';

@Module({
    imports: [ConfigsModule, DatabaseModule],
    providers: [CryptoRsaService, GenerateCodeService],
    exports: [CryptoRsaService, GenerateCodeService],
})
export class SharedModule { }
