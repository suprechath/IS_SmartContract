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

// @desc Get user profile
// @route GET /api/users/me
export const getUserProfile = async (req, res) => {
    // req.user is attached by the protect middleware
    const user = req.user;
    handleResponse(res, 200, 'User profile retrieved successfully', user);
};

// @desc    Update user profile
// @route   PUT /api/users/me
export const updateUserProfile = async (req, res) => {
  const { id } = req.user;
  const { name, email } = req.body;
  try {
    const updatedUser = await userModel.updateUser(id, { name, email });
    if (!updatedUser) {
      return handleResponse(res, 404, 'User not found.');
    }
    handleResponse(res, 200, 'User profile updated successfully', updatedUser);
  } catch (error) {
    if (error.code === '23505') {
      return handleResponse(res, 409, 'A user with this email already exists.');
    }
    console.error('Update User Profile Error:', error);
    handleResponse(res, 500, 'Server error during profile update.', error.message);
  }
};