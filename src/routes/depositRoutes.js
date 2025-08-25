import express from 'express';
import { prepareDeposit, recordDeposit } from '../controllers/depositController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { prepareDepositSchema, recordDepositSchema } from '../middlewares/depositSchema.js';

const router = express.Router();

router.post('/', protect('Project Creator'), validate(prepareDepositSchema), prepareDeposit); //POST /api/deposits/
router.post('/record', protect('Project Creator'), validate(recordDepositSchema), recordDeposit); //POST /api/deposits/record

export default router;