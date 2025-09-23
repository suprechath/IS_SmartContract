// src/routes/transactionRoutes.js
import express from 'express';
import { recordTransaction, getMyTransactions, getProjectTransactions, getDividendTransactions } from '../controllers/transactionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { recordTransactionSchema, getProjectTransactionsSchema } from '../middlewares/transactionSchema.js';

const router = express.Router();

router.post('/record', protect(), validate(recordTransactionSchema), recordTransaction); //POST /api/transactions/record
router.get('/my', protect(), getMyTransactions); // GET /api/transactions/my
router.get('/project/:projectId', validate(getProjectTransactionsSchema), getProjectTransactions); //GET /api/transactions/project/:projectId

router.get('/dividends', protect("Platform Operator"), getDividendTransactions); // New endpoint
export default router;