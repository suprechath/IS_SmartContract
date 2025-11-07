import { jest, describe, beforeAll, it, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app from '../app.js';
import userModel from '../models/userModel.js';

import pool from '../config/db.js';
import e from 'express';

dotenv.config();

describe('User Endpoints', () => {
    let investorToken, operatorToken, creatorToken;
    let investorUserId, operatorUserId, creatorUserId;

    const investorData = {
        full_name: 'Test Investor',
        date_of_birth: '1990-01-01',
        address: '123 Investor St',
        identification_number: 'ID_INVESTOR_123',
        email: 'investor@example.com',
        wallet_address: '0x1111111111111111111111111111111111111111',
        role: 'Investor'
    };

    // const operatorData = {
    //     full_name: 'Test Operator',
    //     date_of_birth: '1980-01-01',
    //     address: '123 Operator St',
    //     identification_number: 'ID_OPERATOR_123',
    //     email: 'operator@example.com',
    //     wallet_address: '0x2222222222222222222222222222222222222222',
    //     role: 'Platform Operator'
    // };

    const creatorData = {
        full_name: 'Test Creator',
        date_of_birth: '1985-01-01',
        address: '123 Creator St',
        identification_number: 'ID_CREATOR_123',
        email: 'creator@example.com',
        wallet_address: '0x3333333333333333333333333333333333333333',
        role: 'Project Creator'
    };

    const errorUserData = {
        full_name: 'Error User',
        date_of_birth: '1990-01-01',
        address: '123 Error St',
        identification_number: 'ID123457',
        email: 'erroruser@example.com',
        wallet_address: '1NE2NiGhhbkFPSEyNWwj7hKGhGDedBtSrQ',
        role: 'Investor'
    };

    const createToken = (id, role) => {
        return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    };

    beforeAll(async () => {
        const investorRes = await request(app)
            .post('/api/users/register')
            .send(investorData);
        investorUserId = investorRes.body.data.id;
        investorToken = createToken(investorUserId, investorData.role);

        const errorUserRes = await request(app)
            .post('/api/users/register')
            .send(errorUserData);
        errorUserUserId = errorUserRes.body.data.id;
        errorUserToken = createToken(errorUserUserId, errorUserData.role);

        const operatorRes = await request(app)
            .post('/api/users/register')
            .send(operatorData);
        operatorUserId = operatorRes.body.data.id;
        operatorToken = createToken(operatorUserId, operatorData.role);

        const creatorRes = await request(app)
            .post('/api/users/register')
            .send(creatorData);
        creatorUserId = creatorRes.body.data.id;
        creatorToken = createToken(creatorUserId, creatorData.role);
    });

    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({ ...investorData, wallet_address: '0x5555555555555555555555555555555555555555', identification_number: 'ID_5551' });
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('User registered successfully');
            expect(res.body.data).toHaveProperty('id');
        });

        it('should not register duplicate user (email)', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({ ...investorData, wallet_address: '0x5555555555555555555555555555555555555555', identification_number: 'ID_5551' });
            expect(res.statusCode).toBe(409);
            expect(res.body.message).toMatch(/already exists/i);
        });

        it('should return 400 for invalid data (e.g., invalid email)', async () => {
            const invalidData = { ...errorUserData, email: 'not-an-email' };
            const res = await request(app)
                .post('/api/users/register')
                .send(invalidData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('"email" must be a valid email');
        });

        it('should return 500 for a server error', async () => {
            const mockError = new Error('Simulated database failure');
            const spy = jest.spyOn(userModel, 'registerUserServices').mockRejectedValue(mockError);

            const res = await request(app)
                .post('/api/users/register')
                .send(investorData);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Server error during registration.');
            expect(res.body.data).toBe('Simulated database failure');

            spy.mockRestore();
        });
    });

    describe('GET /api/sanctions/check', () => {
        it('should get user\'s own sanction status successfully (200)', async () => {
            const res = await request(app)
                .get('/api/sanctions/check')
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Sanction status retrieved');
        });

        it('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .get('/api/sanctions/check');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toContain('Not authorized, no token');
        });

        it('should return 404 if user from token not found in DB', async () => {
            const res = await request(app)
                .get('/api/sanctions/check')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toContain('Not authorized, user not found');
        });
    });

    describe('GET /api/users/me', () => {
        it('should get user profile successfully (200)', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`);
            console.log(res.body);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('User profile retrieved successfully');
            expect(res.body.data.email).toBe(investorData.email);
            expect(res.body.data.full_name).toBe(investorData.full_name);
        });

        it('should return 404 if user profile not found', async () => {
            const spy = jest.spyOn(userModel, 'getFullUserProfileById').mockResolvedValue(null);

            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toContain('User not found.');

            spy.mockRestore();
        });

        it('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .get('/api/users/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toContain('Not authorized, no token');
        });

        it('should return 500 for a server error', async () => {
            const mockError = new Error('Simulated DB error');
            const spy = jest.spyOn(userModel, 'getFullUserProfileById').mockRejectedValue(mockError);

            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toContain('Server error while retrieving user profile.');

            spy.mockRestore();
        });
    });

    describe('PUT /api/users/me', () => {
        it('should update user profile successfully (200)', async () => {
            const updateData = { full_name: 'Updated Test Investor' };
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('User profile updated successfully');
            expect(res.body.data.full_name).toBe(updateData.full_name);

            // Revert name for other tests
            await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`)
                .send({ full_name: investorData.full_name });
        });

        it('should return 400 for invalid update data', async () => {
            const invalidData = { email: 'not-a-real-email' };
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('"email" must be a valid email');
        });

        it('should return 400 if update data is empty', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${investorToken}`)
                .send({}); // Empty body

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('"value" must have at least 1 key');
        });
    });

    describe('GET /api/users/onchain', () => {
        it('should get all onchain users successfully (200) for Platform Operator', async () => {
            const res = await request(app)
                .get('/api/users/onchain')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Onchain users retrieved successfully');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(3); // Investor, Operator, Creator
        });

        it('should return 403 (Forbidden) for non-operator user', async () => {
            const res = await request(app)
                .get('/api/users/onchain')
                .set('Authorization', `Bearer ${investorToken}`); // Use Investor token

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('User role is not authorized for this action');
        });

        it('should return 401 (Unauthorized) for unauthenticated user', async () => {
            const res = await request(app)
                .get('/api/users/onchain');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Not authorized, no token');
        });

        it('should return 500 for a server error', async () => {
            const mockError = new Error('Simulated DB error');
            const spy = jest.spyOn(userModel, 'getAllUsersOnchain').mockRejectedValue(mockError);

            const res = await request(app)
                .get('/api/users/onchain')
                .set('Authorization', `Bearer ${operatorToken}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Server error while retrieving onchain users.');

            spy.mockRestore();
        });
    });

    // describe('GET /api/users/id/:userId', () => {
    //     it('should get user by ID successfully (200) for Platform Operator', async () => {
    //         const res = await request(app)
    //             .get(`/api/users/id/${creatorUserId}`) // Get creator's profile
    //             .set('Authorization', `Bearer ${operatorToken}`);

    //         expect(res.statusCode).toBe(200);
    //         expect(res.body.message).toBe('User profile retrieved successfully');
    //         expect(res.body.data.email).toBe(creatorData.email);
    //         expect(res.body.data.id).toBe(creatorUserId);
    //     });

    //     it('should return 404 if user not found', async () => {
    //         const res = await request(app)
    //             .get('/api/users/id/9999999') // Non-existent ID
    //             .set('Authorization', `Bearer ${operatorToken}`);

    //         expect(res.statusCode).toBe(404);
    //         expect(res.body.message).toBe('User not found.');
    //     });

    //     it('should return 403 (Forbidden) for non-operator user', async () => {
    //         const res = await request(app)
    //             .get(`/api/users/id/${operatorUserId}`) // Investor tries to get operator profile
    //             .set('Authorization', `Bearer ${investorToken}`);

    //         expect(res.statusCode).toBe(403);
    //         expect(res.body.message).toBe('User role is not authorized for this action');
    //     });

    //     it('should return 401 (Unauthorized) for unauthenticated user', async () => {
    //         const res = await request(app)
    //             .get(`/api/users/id/${investorUserId}`);

    //         expect(res.statusCode).toBe(401);
    //         expect(res.body.message).toBe('Not authorized, no token');
    //     });
    // });
});