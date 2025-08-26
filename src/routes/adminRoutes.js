import express from 'express';
import { verifyUser } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { reviewProjectSchema } from '../middlewares/adminSchema.js';
import { validate } from '../middlewares/validator.js';
import { reviewProject } from '../controllers/adminController.js';

const router = express.Router();

router.post('/verify-user', protect("Platform Operator"), verifyUser); //POST http://localhost:5001/api/admin/verify-user
router.post('/projects/review', protect('Platform Operator'), validate(reviewProjectSchema), reviewProject); //POST /api/admin/projects/review
// router.post('/projects/deploy', protect('Platform Operator'), validate(deployProjectSchema), deployProject); //POST /api/admin/projects/deploy

export default router;