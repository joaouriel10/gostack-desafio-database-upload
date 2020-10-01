import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import transactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const repository = getCustomRepository(transactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await repository.getBalance();

    if (type == "outcome" && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let transactionCategory = await categoryRepository.findOne({ where: { title: category } });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = repository.create({
      title, value, type, category: transactionCategory
    });

    await repository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
