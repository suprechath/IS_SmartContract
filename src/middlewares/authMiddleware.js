import jwt from 'jsonwebtoken';
import { handleResponse } from '../utils/responseHandler.js';
import userModel from '../models/userModel.js';

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Get user from the token
            req.user = await userModel.getUserById(decoded.id);
            console.log('User from token:', req.user.id);
            if (!req.user) {
                return handleResponse(res, 401, 'Not authorized, user not found.');
            }
            next();
        } catch (error) {
            console.error(error);
            return handleResponse(res, 401, 'Not authorized, token failed.');
        }
    }
    if (!token) {
        return handleResponse(res, 401, 'Not authorized, no token.');
    }
};