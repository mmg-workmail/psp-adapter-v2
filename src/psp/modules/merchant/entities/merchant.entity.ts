
import { Currency } from 'src/psp/enums/currency';
import {
    Column,
    Index,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Merchant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', name: 'name' })
    name: string;

    @Column({ type: 'varchar', name: 'merchant_id' })
    merchantId: string;

    @Column({ type: 'varchar', name: 'callback_url' })
    callbackUrl: string;

    @Column({ type: 'varchar' })
    @Index({ unique: true })
    token: string;

    @Column({ type: 'enum', enum: Currency, default: Currency.TOM })
    currency: Currency;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}
