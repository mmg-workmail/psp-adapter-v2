import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionStats } from '../../../entities/transaction-stats.entity';
import { Repository } from 'typeorm';
import { CreateTransactionStatsDto } from '../../../dto/db/create-transaction-stats.dto';

@Injectable()
export class TransactionStatsService {
    constructor(
        @InjectRepository(TransactionStats) private readonly transactionStatsRepository: Repository<TransactionStats>,
    ) { }

    create(createTransactionStatsDto: CreateTransactionStatsDto) {
        return this.transactionStatsRepository.save(createTransactionStatsDto);
    }

}
