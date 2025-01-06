import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    ) { }

    checkOrderId(orderId: string) {
        return this.transactionRepository.findOne({ where: { orderId } });
    }

    checkExternalOrderId(externalOrderId: string) {
        return this.transactionRepository.findOne({ where: { externalOrderId }, relations: ['merchant'] });
    }

    checkExternalTrackNumber(externalTrackNumber: string) {
        return this.transactionRepository.findOne({ where: { externalTrackNumber } });
    }

    create(createTransactionDto: CreateTransactionDto) {
        return this.transactionRepository.save(createTransactionDto);
    }

    save(transaction: Transaction) {
        return this.transactionRepository.save(transaction);
    }

}
