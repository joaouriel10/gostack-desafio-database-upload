import { Router } from 'express';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import { Server, getCustomRepository } from 'typeorm';
import uploadConfig from '../config/uploadConfig';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();
  const transactions = await transactionsRepository.find({
    select: ['id', 'title', 'type', 'value', 'category'],
    relations: ['category'],
  });

  transactions.map(transaction => {
    const transactionCopy = { ...transaction };
    delete transactionCopy.category.created_at;
    delete transactionCopy.category.updated_at;
    return transactionCopy;
  });

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const service = new CreateTransactionService();

  const transaction = await service.execute({ title, value, type, category });

  return response.json(transaction)
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const service = new DeleteTransactionService();

  await service.execute(id);

  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const service = new ImportTransactionsService();

  const transactions = await service.execute(request.file.path);

  return response.json(transactions);
});

export default transactionsRouter;
