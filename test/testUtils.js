import request from 'supertest';
import app from '../src/index.js';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import userModel from '../src/models/userModel.js';

export const createUserAndLogin = async (role = 'Project Creator') => {
    const wallet = ethers.Wallet.createRandom();

    // Create user directly in the database
    await userModel.registerUserServices(
        `Test User ${Math.random().toString(36).substring(2, 9)}`,
        '1990-01-01',
        '123 Test St',
        Math.random().toString(36).substring(2, 12), // random to avoid unique constraint
        `${Math.random().toString(36).substring(2, 12)}@test.com`, // random to avoid unique constraint
        wallet.address,
        role
    );

    // Get nonce token
    const nonceRes = await request(app).get(`/api/auth/nonce/${wallet.address}`);
    console.log('Nonce response:', nonceRes.body);
    const { nonceToken } = nonceRes.body.data;

    // Decode nonce token to get the nonce
    const decodedToken = jwt.decode(nonceToken);
    const { nonce } = decodedToken;

    // Sign the extracted nonce
    const signature = await wallet.signMessage(nonce);

    // Verify signature (login)
    const verifyRes = await request(app)
        .post('/api/auth/verify')
        .send({
            nonceToken: nonceToken,
            signature: signature
        });

    return { token: verifyRes.body.data.token, user: verifyRes.body.data.user, wallet };
};
