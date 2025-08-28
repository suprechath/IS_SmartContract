import userModel from '../models/userModel.js';
import { handleResponse } from '../utils/responseHandler.js';


// @desc    Register a new user as Investor or Project Creator
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
  const {
    full_name,
    date_of_birth,
    address,
    identification_number,
    email,
    wallet_address,
    role,
  } = req.body;
  try {
    const newUser = await userModel.registerUserServices(
      full_name,
      date_of_birth,
      address,
      identification_number,
      email,
      wallet_address,
      role
    );
    handleResponse(res, 201, 'User registered successfully', newUser);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation error
      return handleResponse(res, 409, 'A user with this email, wallet address, or identification number already exists.');
    }
    console.error('Registration Error:', error);
    handleResponse(res, 500, 'Server error during registration.', error.message);
  }
};

// @desc Get user profile
// @route GET /api/users/me
export const getUserProfile = async (req, res) => {
    const user = req.user;
    handleResponse(res, 200, 'User profile retrieved successfully', user);
};

// @desc    Update user profile
// @route   PUT /api/users/me
export const updateUserProfile = async (req, res) => {
  const { id } = req.user;
  try {
    const updatedProfile = await userModel.updateUser(id, req.body);
    if (!updatedProfile) {
      return handleResponse(res, 404, 'User profile not found.');
    }
    handleResponse(res, 200, 'User profile updated successfully', updatedProfile);
  } catch (error) {
    if (error.code === '23505') {
      return handleResponse(res, 409, 'A user with this email already exists.');
    }
    console.error('Update Profile Error:', error);
    handleResponse(res, 500, 'Server error during profile update.', error.message);
  }
};
