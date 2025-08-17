// Standardized response function
// const userModel = require('../models/userModel.js');
import userModel from '../models/userModel.js';

const handleResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        data: data
    });
};

export const createUser = async (req, res, next) => {
    const { name, email } = req.body;
    try {
        const newUser = await userModel.createUserServices(name, email);
        handleResponse(res, 201, 'User created successfully', newUser);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await userModel.getAllUsersServices();
        handleResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await userModel.getUserByIdServices(req.params.id);
        if (!user) {
            return handleResponse(res, 404, 'User not found');
        }
        handleResponse(res, 200, 'User retrieved successfully', user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    const { name, email } = req.body;
    try {
        const updatedUser = await userModel.updateUserServices(name, email, req.params.id);
        if (!updatedUser) {
            return handleResponse(res, 404, 'User not found');
        }
        handleResponse(res, 200, 'User updated successfully', updatedUser);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await userModel.deleteUserServices(req.params.id);
        if (!deletedUser) {
            return handleResponse(res, 404, 'User not found');
        }
        handleResponse(res, 200, 'User deleted successfully', deletedUser);
    } catch (error) {
        next(error);
    }
};

// export default {
//     createUser,
//     getAllUsers,
//     getUserById,
//     updateUser,
//     deleteUser
// };