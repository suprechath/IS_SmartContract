import jwt from 'jsonwebtoken';
import { handleResponse } from '../utils/responseHandler.js';
import userModel from '../models/userModel.js';

export const initProtect = (requiredRole = null) => async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Get user from the token
            const user = await userModel.getUserById(decoded.id);
            
            if (!user) {
                return handleResponse(res, 401, 'Not authorized, user not found.');
            }
            if (requiredRole && user.role !== requiredRole) {
                return handleResponse(res, 403, `Not authorized. ${requiredRole} role required.`);
            }

            req.user = user;
            console.log('User from token:', req.user.id);
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

export const protect = (requiredRole = null) => async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Get user from the token
            const user = await userModel.getUserById(decoded.id);
            
            if (!user) {
                return handleResponse(res, 401, 'Not authorized, user not found.');
            }
            if (user.sanction_status !== 'Verified') {
                return handleResponse(res, 403, 'Action forbidden. Account is not verified or is under sanction review.');
            }
            if (requiredRole && user.role !== requiredRole) {
                return handleResponse(res, 403, `Not authorized. ${requiredRole} role required.`);
            }

            req.user = user;
            console.log('User from token:', req.user.id);
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