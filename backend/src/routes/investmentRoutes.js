import express from 'express';
import { investmentCheck } from '../controllers/investmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { prepareInvestmentSchema } from '../middlewares/investmentSchema.js';

const router = express.Router();

router.post('/check', protect('Investor'), validate(prepareInvestmentSchema), investmentCheck); //POST /api/investments/check

export default router;