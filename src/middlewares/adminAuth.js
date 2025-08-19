import jwt from 'jsonwebtoken';
import { handleResponse } from '../utils/responseHandler.js';
import userModel from '../models/userModel.js';

export const protectAdmin = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Check if the user is a Platform Operator
            const user = await userModel.getUserById(decoded.id);

            if (user && user.role === 'Platform Operator') {
                req.user = user;
                next();
            } else {
                return handleResponse(res, 403, 'Not authorized. Platform Operator role required.');
            }
        } catch (error) {
            console.error(error);
            return handleResponse(res, 401, 'Not authorized, token failed.');
        }
    }
    if (!token) {
        return handleResponse(res, 401, 'Not authorized, no token.');
    }
};