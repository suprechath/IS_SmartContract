import userModel from '../models/userModel.js';
import { handleResponse } from '../utils/responseHandler.js';

// @desc    Register a new user as Investor or Project Creator
// @route   POST /api/users/register
export const registerUser = async (req, res, next) => {
  const { wallet_address, name, email, nonce, role } = req.body;
  try {
    const newUser = await userModel.registerUserServices(wallet_address, name, email, nonce, role);
    handleResponse(res, 201, 'User registered successfully', newUser);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation error
      return handleResponse(res, 409, 'A user with this email or wallet address already exists.');
    }
    console.error('Registration Error:', error);
    next(error);
    // handleResponse(res, 500, 'Server error during user registration.');
  }
};