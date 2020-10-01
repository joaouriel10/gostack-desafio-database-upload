import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const repository = getCustomRepository(TransactionsRepository);

    const transaction = await repository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction does not exist.');
    }

    await repository.remove(transaction);
  }
}

export default DeleteTransactionService;
