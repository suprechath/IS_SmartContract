import { handleResponse } from '../utils/responseHandler.js';
import pool from '../config/db.js';
import crypto from 'crypto';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const NONCE_JWT_SECRET = process.env.JWT_SECRET

// @desc    Get a nonce for a user to sign
// @route   GET /api/auth/nonce/:walletAddress
export const getNonce = async (req, res) => {
    const { walletAddress } = req.params;
    try {
        const user = await userModel.getUserByWalletAddress(walletAddress);
        if (!user) {
            return handleResponse(res, 404, 'User with this wallet address not found. Please register first.');
        }

        const nonce = `comm-efficient-login-${crypto.randomBytes(16).toString('hex')}`;
        const nonceToken = jwt.sign(
            { nonce, walletAddress },
            NONCE_JWT_SECRET,
            { expiresIn: '5m' } // Nonce is valid for 5 minutes
        );
        handleResponse(res, 200, 'Nonce token successfully generated.', { nonceToken });
    } catch (error) {
        console.error('Get Nonce Error:', error);
        handleResponse(res, 500, 'Server error while generating nonce token', error.message);
    }
};

// @desc    Verify the signature and log the user in
// @route   POST /api/auth/verify
export const verifySignature = async (req, res) => {
    const { nonceToken, signature } = req.body;
    try {
        const decodedNonceToken = jwt.verify(nonceToken, NONCE_JWT_SECRET);
        const { nonce, walletAddress } = decodedNonceToken;

        const signerAddress = ethers.verifyMessage(nonce, signature);
        if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return handleResponse(res, 401, 'Signature verification failed. Invalid signature.');
        }
        
        const user = await userModel.getUserByWalletAddress(walletAddress);
        if (!user) {
            return handleResponse(res, 404, 'User not found.');
        }

        const loginToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Real login token is valid for 1 hour
        );
        const expiresAt = jwt.decode(loginToken).exp * 1000;
        console.log(`JWT created for ${user.wallet_address}: ${loginToken}`); //This must be deleted in production
        
        handleResponse(res, 200, 'Login successful!', {
            token: loginToken,
            expiresAt: new Date(expiresAt).toISOString(),
            user: {
                id: user.id,
                role: user.role,
                wallet_address: walletAddress
            }
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return handleResponse(res, 401, 'The signing request has expired. Please try again.');
        }
        console.error('Verify Signature Error:', error);
        handleResponse(res, 500, 'Server error during verification', error.message);
    }
};