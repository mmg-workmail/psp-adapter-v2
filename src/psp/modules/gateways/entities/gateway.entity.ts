
import { Currency } from 'src/psp/enums/currency';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    AfterLoad,
    AfterInsert,
    AfterUpdate,
} from 'typeorm';
import { Merchant } from '../../merchant/entities/merchant.entity';
import { JsonUtils } from 'src/shared/classes/json-utils/json-utils';
import { Encryption } from 'src/shared/classes/encryption/encryption';
import { GatewayType } from '../../transaction/infrastructure/enums/gateway-type';

@Entity()
export class Gateway {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', name: 'name' })
    name: string;

    // Example of a One-to-One relationship (optional)
    @OneToOne(() => Merchant, { nullable: false })
    @JoinColumn()
    merchant: Merchant;

    @Column({ type: 'varchar', name: 'encoded_config' })
    encodedConfig: string | object;

    @Column({ type: 'enum', enum: GatewayType, name: 'type' })
    type: GatewayType;

    @Column({ type: 'enum', enum: Currency, default: Currency.TOM, name: 'currency_deposit' })
    currencyDeposit: Currency;

    @Column({ type: 'enum', enum: Currency, default: Currency.TOM, name: 'currency_exchange' })
    currencyExchange: Currency;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;


    // Convert encodedConfig to a string before insert/update
    @BeforeInsert()
    @BeforeUpdate()
    convertEncodedConfigToString() {
        if (typeof this.encodedConfig == 'object') {
            const encrypt = new Encryption(process.env.ENCRYPTION_KEY);
            const encodedConfig =
                this.encodedConfig = encrypt.encrypt(JsonUtils.jsonToString(this.encodedConfig))
        }
    }

    // Convert encodedConfig back to JSON after loading
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    convertEncodedConfigToJSON() {
        if (typeof this.encodedConfig == 'string') {
            const encrypt = new Encryption(process.env.ENCRYPTION_KEY);
            this.encodedConfig = JsonUtils.stringToJson(encrypt.decrypt(this.encodedConfig));
        }
    }

}
