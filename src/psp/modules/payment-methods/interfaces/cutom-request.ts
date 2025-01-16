import { Request } from 'express';
import { Transaction } from '../../transaction/entities/transaction.entity';

export interface CustomRequest extends Request {
    transaction?: Transaction; // Adjust the type based on your actual transaction structure
}
