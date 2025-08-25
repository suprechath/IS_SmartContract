import express from 'express';
import { getWithdrawal, recordWithdrawal } from '../controllers/withdrawalController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { getWithdrawalSchema, recordWithdrawalSchema } from '../middlewares/withdrawalSchema.js';

const router = express.Router();

router.get('/', protect('Project Creator'), validate(getWithdrawalSchema), getWithdrawal); //GET /api/withdrawals/
router.post('/record', protect('Project Creator'), validate(recordWithdrawalSchema), recordWithdrawal);

export default router;