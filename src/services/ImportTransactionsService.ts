import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, getCustomRepository, In } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: Number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const ReadStream = fs.createReadStream(filePath);

    const parser = csvParse({
      from_line: 2
    });

    const parceCSV = ReadStream.pipe(parser);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parceCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim()
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });

    });

    await new Promise(resolve => parceCSV.on('end', resolve));

    const cRepository = getRepository(Category);
    const tRepository = getCustomRepository(TransactionsRepository);

    const existCategories = await cRepository.find({ where: { title: In(categories) } });

    const existentCategories = existCategories.map((category: Category) => category.title);

    const addCategoryTitle = categories.filter(category => !existentCategories.includes(category))
    .filter((value, index, self) => self.indexOf(value) == index);

    const newCategories = await cRepository.create(
      addCategoryTitle.map(title => ({
        title
      }))
    );

    await cRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existCategories];

    const createdTransactions = tRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: Number(transaction.value),
        type: transaction.type,
        category: finalCategories.find(category => category.title === transaction.category)
      }))
    );

    await tRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
