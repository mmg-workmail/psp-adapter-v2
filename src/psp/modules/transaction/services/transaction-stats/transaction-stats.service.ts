import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionStats } from '../../entities/transaction-stats.entity';
import { Repository } from 'typeorm';
import { CreateTransactionStatsDto } from '../../dto/create-transaction-stats.dto';

@Injectable()
export class TransactionStatsService {

    private readonly logger = new Logger(TransactionStatsService.name, { timestamp: true });

    constructor(
        @InjectRepository(TransactionStats) private readonly transactionStatsRepository: Repository<TransactionStats>,
    ) { }

    async create(createTransactionStatsDto: CreateTransactionStatsDto) {

        const transactionStats = await this.transactionStatsRepository.save(createTransactionStatsDto);
        this.logger.log(`Transaction ${transactionStats.status} stats was created with id : ${transactionStats.id}`);

        return transactionStats
    }

    async findLastItem(transactionId: number) {
        return this.transactionStatsRepository.findOne({
            where: { transaction: { id: transactionId } },
            order: {
                id: 'DESC', // Get the last item based on id
            },
        });
    }


}
