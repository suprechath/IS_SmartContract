import express from 'express';
import { verifyUser } from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

router.post('/verify-user', protectAdmin, verifyUser); //POST http://localhost:3001/api/admin/verify-user

export default router;