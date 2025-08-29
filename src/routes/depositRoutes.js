import express from 'express';
import { prepareDeposit } from '../controllers/depositController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { prepareDepositSchema } from '../middlewares/depositSchema.js';

const router = express.Router();

router.post('/', protect('Project Creator'), validate(prepareDepositSchema), prepareDeposit); //POST /api/deposits/

export default router;