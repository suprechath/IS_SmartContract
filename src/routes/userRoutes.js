import express from 'express';
import { registerUser } from '../controllers/userController.js';
import { validate } from '../middlewares/validator.js';
import { registerSchema } from '../middlewares/userSchema.js';


const router = express.Router();

// This sets up the endpoint: POST http://localhost:3001/api/users/register
router.post('/register', validate(registerSchema), registerUser);

export default router;