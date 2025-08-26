import { handleResponse } from '../utils/responseHandler.js';
import userModel from '../models/userModel.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// @route   GET /api/sanctions/check
export const checkSanction = async (req, res) => {
    // Get wallet address from the authenticated user attached by the 'protect' middleware
    const { wallet_address } = req.user;
    if (!wallet_address) {
        return handleResponse(res, 400, 'User has no wallet address to check.');
    }

    try {
        const response = await axios.get(`https://sanctions.api.scorechain.com/v1/addresses/${wallet_address}`, {
            headers: {
                'x-api-key': process.env['x-api-key']
            }
        });
        console.log('Sanction Check Response:', response.data);
        if (response.data.isSanctioned) {
            await userModel.updateSanctionStatus(req.user.id, 'Rejected');
        } else {
            await userModel.updateSanctionStatus(req.user.id, 'Verified');
        }
        handleResponse(res, 200, 'Sanction status retrieved successfully.', response.data);
    } catch (error) {
        console.error('Sanction Check Error:', error);
        if (error.response) {
            handleResponse(res, error.response.status, error.response.data.message || 'Error from sanctions API.', error.response.data);
        } else {
            handleResponse(res, 500, 'Server error during sanction check.', error.message);
        }
    }
};