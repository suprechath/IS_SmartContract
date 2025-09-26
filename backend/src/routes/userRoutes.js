import express from 'express';
import { registerUser, getUserProfile, updateUserProfile, getAllUsersOnchain, getUserById} from '../controllers/userController.js';
import { validate } from '../middlewares/validator.js';
import { registerSchema, updateUserSchema } from '../middlewares/userSchema.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/register', validate(registerSchema), registerUser); //POST http://localhost:5001/api/users/register
router.get('/me', protect(), getUserProfile); //GET http://localhost:5001/api/users/me
router.put('/me', protect(), validate(updateUserSchema), updateUserProfile); //PUT http://localhost:5001/api/users/me

router.get('/onchain', protect("Platform Operator"), getAllUsersOnchain); // New endpoint
router.get('/id/:userId', protect("Platform Operator"), getUserById); // New endpoint

export default router;