import express from 'express';
import { getRewards, recordRewards } from '../controllers/rewardController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { getClaimSchema, recordClaimSchema } from '../middlewares/rewardSchema.js';

const router = express.Router();

router.get('/', protect('Investor'), validate(getClaimSchema), getRewards);
router.post('/record', protect('Investor'), validate(recordClaimSchema), recordRewards);

export default router;