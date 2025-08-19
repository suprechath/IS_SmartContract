import express from 'express';
import { registerUser } from '../controllers/userController.js';
import { validateRegisterInput } from '../middlewares/userValidator.js';

const router = express.Router();

// This sets up the endpoint: POST http://localhost:3001/api/users/register
router.post('/register', validateRegisterInput, registerUser);

export default router;