import { TransactionStatus } from "src/psp/enums/TransactionStatus";
import { Transaction } from "../entities/transaction.entity";

export class CreateTransactionStatsDto {
    status: TransactionStatus;
    transaction: Transaction;

    constructor(partial?: Partial<CreateTransactionStatsDto>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }

}
