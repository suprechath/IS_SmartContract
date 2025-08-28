import express from 'express';
import { checkSanction } from '../controllers/sanctionController.js';
import { initProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/check', initProtect(), checkSanction); // GET http://localhost:5001/api/sanctions/check

export default router;