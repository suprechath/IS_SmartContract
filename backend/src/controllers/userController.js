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
    try {
        const user = await userModel.getFullUserProfileById(req.user.id);
        if (!user) {
            return handleResponse(res, 404, 'User not found.');
        }
        handleResponse(res, 200, 'User profile retrieved successfully', user);
    } catch (error) {
        console.error('Get User Profile Error:', error);
        handleResponse(res, 500, 'Server error while retrieving user profile.', error.message);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/me
export const updateUserProfile = async (req, res) => {
  const { id } = req.user;
  console.log('Updating profile for user ID:', id);
  const offchainDataToUpdate = req.body;
  try {
    await userModel.updateUser(id, offchainDataToUpdate);
    const updatedUserProfile = await userModel.getFullUserProfileById(id);
    if (!updatedUserProfile) {
      return handleResponse(res, 404, 'User profile not found after update.');
    }
    handleResponse(res, 200, 'User profile updated successfully', updatedUserProfile);
  } catch (error) {
    if (error.code === '23505') {
      return handleResponse(res, 409, 'A user with this email already exists.');
    }
    console.error('Update Profile Error:', error);
    handleResponse(res, 500, 'Server error during profile update.', { error: error.message });
  }
};

// @desc Get all onchain users
// @route GET /api/users/onchain
export const getAllUsersOnchain = async (req, res) => {
    try {
        const users = await userModel.getAllUsersOnchain();
        handleResponse(res, 200, 'Onchain users retrieved successfully', users);
    } catch (error) {
        console.error('Get All Onchain Users Error:', error);
        handleResponse(res, 500, 'Server error while retrieving onchain users.', error.message);
    }
};
