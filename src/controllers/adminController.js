import userModel from '../models/userModel.js';
import { handleResponse } from '../utils/responseHandler.js';

// @route   POST /api/admin/verify-user
export const verifyUser = async (req, res) => {
    const { userId, status } = req.body; // status should be 'Verified' or 'Rejected'

    if (!userId || !status) {
        return handleResponse(res, 400, 'User ID and status are required.');
    }

    try {
        const user = await userModel.getUserById(userId);
        if (!user) {
            return handleResponse(res, 404, 'User not found.');
        }

        const updatedUser = await userModel.updateKycStatus(userId, status);

        // This is where you would trigger a "hook" in a real system
        // For now, we just return a success message.
        console.log(`Hook simulation: User ${updatedUser.wallet_address} status updated to ${updatedUser.kyc_status}`);
        
        handleResponse(res, 200, `User status successfully updated to ${status}`, updatedUser);

    } catch (error) {
        console.error('Verification Error:', error);
        handleResponse(res, 500, 'Server error during user verification.', error.message);
    }
};