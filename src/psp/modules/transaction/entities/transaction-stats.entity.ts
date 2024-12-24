
import { TransactionStatus } from "src/psp/enums/TransactionStatus";
import {
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
    Entity,
    ManyToOne,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class TransactionStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.INITIATED, name: 'status' })
    status: TransactionStatus;

    @ManyToOne(() => Transaction, (transaction) => transaction.id)
    @JoinColumn()
    transaction: Transaction;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;
}
