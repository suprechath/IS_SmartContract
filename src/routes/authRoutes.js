import express from 'express';
import { getNonce, verifySignature } from '../controllers/authController.js';
import { validate } from '../middlewares/validator.js';
import { nonceSchema, verifySchema } from '../middlewares/authSchema.js';
// ...

const router = express.Router();

//login
router.get('/nonce/:walletAddress', validate(nonceSchema), getNonce); //GET http://localhost:5001/api/auth/nonce/:walletAddress
router.post('/verify', validate(verifySchema), verifySignature); //POST http://localhost:5001/api/auth/verify

export default router;