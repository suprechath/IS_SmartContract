import express from 'express';
import { prepareInvestment, recordInvestment } from '../controllers/investmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { prepareInvestmentSchema, recordInvestmentSchema } from '../middlewares/investmentSchema.js';

const router = express.Router();

router.post('/prepare', protect('Investor'), validate(prepareInvestmentSchema), prepareInvestment); //POST /api/investments/prepare
router.post('/record', protect('Investor'), validate(recordInvestmentSchema), recordInvestment); //POST /api/investments/record

export default router;