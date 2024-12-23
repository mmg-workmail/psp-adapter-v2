import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, DatabaseConfig } from '../../interface';
import { ConfigKey } from '../../enum';

@Injectable()
export class ConfigSystemService {

    constructor(private readonly configService: ConfigService) { }

    public readonly app: AppConfig = this.setApp();
    public readonly db: DatabaseConfig = this.setDb();

    private setApp(): AppConfig {
        return this.configService.get<AppConfig>(ConfigKey.APP)
    }

    private setDb(): DatabaseConfig {
        return this.configService.get<DatabaseConfig>(ConfigKey.DB)
    }
}
