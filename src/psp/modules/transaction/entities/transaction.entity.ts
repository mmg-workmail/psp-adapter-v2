
import { Currency } from 'src/psp/enums/currency';
import {
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    Entity,
    Index,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { Merchant } from '../../merchant/entities/merchant.entity';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, name: 'username', nullable: true })
    username: string;

    @Column({ type: 'varchar', length: 50, name: 'user_id', nullable: true })
    userId: string;

    @Column({ type: 'varchar', length: 50, name: 'order_id' })
    @Index()
    orderId: string;

    @Column({ type: 'varchar', name: 'external_order_id', nullable: true })
    externalOrderId: string;

    @Column({ type: 'varchar', name: 'external_track_number', nullable: true })
    externalTrackNumber: string;



    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount' })
    amount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'actual_deposit_amount', nullable: true })
    actualDepositAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'request_deposit_amount', nullable: true })
    requestDepositAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'exchange_value', nullable: true })
    exchangeValue: number;


    @Column({ type: 'enum', enum: Currency, default: Currency.TOM, name: 'currency' })
    currency: Currency;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Merchant, (merchant) => merchant.id)
    @JoinColumn({ name: 'merchant_id' })
    merchant: Merchant
}