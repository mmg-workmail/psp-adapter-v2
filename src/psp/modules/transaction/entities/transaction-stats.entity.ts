
import { TransactionStatus } from "src/psp/enums/TransactionStatus";
import {
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
    Entity,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class TransactionStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.INITIATED, name: 'status' })
    status: TransactionStatus;

    // Example of a One-to-One relationship (optional)
    @OneToOne(() => Transaction, { nullable: false })
    @JoinColumn()
    transaction: Transaction;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;
}
