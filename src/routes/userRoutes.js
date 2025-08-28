import express from 'express';
import { registerUser, getUserProfile, updateUserProfile} from '../controllers/userController.js';
import { validate } from '../middlewares/validator.js';
import { registerSchema, updateUserSchema } from '../middlewares/userSchema.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/regBP', registerUser); //POST http://localhost:5001/api/users/regBP

router.post('/register', validate(registerSchema), registerUser); //POST http://localhost:5001/api/users/register
router.get('/me', protect(), getUserProfile); //GET http://localhost:5001/api/users/me
router.put('/me', protect(), validate(updateUserSchema), updateUserProfile); //PUT http://localhost:5001/api/users/me

export default router;