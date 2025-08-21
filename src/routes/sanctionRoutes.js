import express from 'express';
import { checkSanction } from '../controllers/sanctionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/check', protect(), checkSanction); // GET http://localhost:5001/api/sanctions/check

export default router;