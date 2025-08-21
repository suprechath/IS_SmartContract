import express from 'express';
import { verifyUser } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// manual allow registered users to be verified
router.post('/verify-user', protect("Platform Operator"), verifyUser); //POST http://localhost:5001/api/admin/verify-user

export default router;