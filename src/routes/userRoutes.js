import express from 'express';
import { registerUser } from '../controllers/userController.js';

const router = express.Router();

// This sets up the endpoint: POST http://localhost:3001/api/users/register
router.post('/register', registerUser);

export default router;