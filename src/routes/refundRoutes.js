import express from 'express';
import { getRefund, recordRefund } from '../controllers/refundController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { getRefundSchema, recordRefundSchema } from '../middlewares/refundSchema.js';

const router = express.Router();

router.get('/', protect('Investor'), validate(getRefundSchema), getRefund); //http://localhost:5001/api/refunds/?projectId=<YOUR_PROJECT_ID>
router.post('/record', protect('Investor'), validate(recordRefundSchema), recordRefund); //http://localhost:5001/api/refunds/record

export default router;