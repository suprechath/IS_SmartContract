import express from 'express';
import { checkSanction } from '../controllers/sanctionController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Import the general protect middleware

const router = express.Router();

router.get('/check', protect, checkSanction); // GET http://localhost:5001/api/sanctions/check

export default router;