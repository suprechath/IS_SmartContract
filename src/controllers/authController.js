import { handleResponse } from '../utils/responseHandler.js';
import pool from '../config/db.js';
import crypto from 'crypto';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// @desc    Get a nonce for a user to sign
// @route   GET /api/auth/nonce/:walletAddress
export const getNonce = async (req, res) => {
    const { walletAddress } = req.params;
    try {
        const getUserNonce = await userModel.getUserNonce(walletAddress);
        const nonce = `comm-efficient-login-${crypto.randomBytes(16).toString('hex')}`;
        if (!getUserNonce) {
            return handleResponse(res, 404, 'User with this wallet address not found. Please register first.');
        }else {
            await userModel.pushUserNonce(walletAddress, nonce);
            console.log('Nonce pushed to database for wallet address:', walletAddress);
            handleResponse(res, 200, 'Nonce successfully generated.', { nonce });
        }
    } catch (error) {
        console.error('Get Nonce Error:', error);
        handleResponse(res, 500, 'Server error while generating nonce', error.message);
    }
};

// @desc    Verify the signature and log the user in
// @route   POST /api/auth/verify
export const verifySignature = async (req, res) => {
    const { wallet_address, signature } = req.body;
    try {
        const user = await userModel.getUserByWalletAddress(wallet_address);
        if (!user || !user.nonce) {
            return handleResponse(res, 404, 'User not found or no nonce available. Please request a nonce first.');
        }
        const signerAddress = ethers.verifyMessage(user.nonce, signature);
        if (signerAddress.toLowerCase() !== wallet_address.toLowerCase()) {
            return handleResponse(res, 401, 'Signature verification failed. Invalid signature.');
        }

        //Invalidate the nonce after use to prevent replay attacks
        const newNonce = "comm-efficient-login";
        await userModel.pushUserNonce(user.wallet_address, newNonce);

        //Create a JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(`JWT created for ${user.wallet_address}: ${token}`);
        handleResponse(res, 200, 'Login successful!', {
            token: token,
            user: {
                id: user.id,
                role: user.role,
                wallet_address: wallet_address
            }
        });
    } catch (error) {
        console.error('Verify Signature Error:', error);
        handleResponse(res, 500, 'Server error during verification', error.message);
    }
};