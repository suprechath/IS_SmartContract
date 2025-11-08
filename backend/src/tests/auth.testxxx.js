import { jest, describe, beforeAll, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { Wallet } from 'ethers';


const TEST_WALLET_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const TEST_WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const testWallet = new Wallet(TEST_WALLET_PRIVATE_KEY);

describe('Auth Endpoints', () => {
    const investorData = {
        full_name: 'Test Investor',
        date_of_birth: '1990-01-01',
        address: '123 Investor St',
        identification_number: 'ID_INVESTOR_123',
        email: 'investor@example.com',
        wallet_address: TEST_WALLET_ADDRESS,
        role: 'Investor'
    };

    beforeAll(async () => {
        const investorRes = await request(app)
            .post('/api/users/register')
            .send(investorData);
    });

    describe('GET /api/auth/nonce/:walletAddress', () => {
        it('should return a nonce token for a valid wallet address', async () => {
            const res = await request(app).get(`/api/auth/nonce/${TEST_WALLET_ADDRESS}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('nonceToken');
        });

        it('should return a 404 error for a non-existent wallet address', async () => {
            const res = await request(app).get('/api/auth/nonce/0x0000000000000000000000000000000000000000');
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('User with this wallet address not found. Please register first.');
        });
    });

    describe('POST /api/auth/verify', () => {
        it('should return a login token for a valid signature', async () => {
            const nonceRes = await request(app).get(`/api/auth/nonce/${TEST_WALLET_ADDRESS}`);
            const { nonceToken } = nonceRes.body.data;
            const signature = await testWallet.signMessage(nonceToken);
            const res = await request(app).post('/api/auth/verify').send({ nonceToken, signature });
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.wallet_address).toBe(TEST_WALLET_ADDRESS);
        });

        it('should return a 401 error for an invalid signature', async () => {
            const nonceRes = await request(app).get(`/api/auth/nonce/${TEST_WALLET_ADDRESS}`);
            const { nonceToken } = nonceRes.body.data;
            const wrongWallet = Wallet.createRandom();
            const invalidSignature = await wrongWallet.signMessage(nonceToken); // Signature from wrong address

            const res = await request(app).post('/api/auth/verify').send({ nonceToken, signature: invalidSignature });
            
            console.log('Verify Response for invalid signature test:', res.body);
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Signature verification failed. Invalid signature.');
        });
    });
});
