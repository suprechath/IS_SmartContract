import express from 'express';
import { getNonce, verifySignature } from '../controllers/authController.js';
import { nonceSchema, verifySchema, validateAuth } from '../middlewares/authValidator.js';

const router = express.Router();

router.get('/nonce/:walletAddress', validateAuth(nonceSchema), getNonce); //GET http://localhost:5001/api/auth/nonce/:walletAddress
router.post('/verify', validateAuth(verifySchema), verifySignature); //POST http://localhost:5001/api/auth/verify

export default router;