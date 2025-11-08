import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import userModel from '../models/userModel.js';

import pool from '../config/db.js';
import e from 'express';

dotenv.config();

describe('User Endpoints', () => {
    let app;
    let operatorToken, creatorToken, errorUserToken;
    let investorUserId, operatorUserId, creatorUserId, errorUserUserId;

    const investorData = {
        full_name: 'Test Investor',
        date_of_birth: '1990-01-01',
        address: '123 Investor St',
        identification_number: 'ID_INVESTOR_123',
        email: 'investor@example.com',
        wallet_address: '0x1111111111111111111111111111111111111111',
        role: 'Investor'
    };

    const operatorData = {
        full_name: 'Test Operator',
        date_of_birth: '1980-01-01',
        address: '123 Operator St',
        identification_number: 'ID_OPERATOR_123',
        email: 'operator@example.com',
        wallet_address: '0x2222222222222222222222222222222222222222',
        role: 'Platform Operator'
    };

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

    jest.unstable_mockModule('../middlewares/authMiddleware.js', () => ({
        protect: jest.fn((requiredRole) => (req, res, next) => {
            const token = req.headers.authorization?.split(' ')[1];
            if (token === operatorToken) {
                req.user = { id: operatorUserId, role: 'Platform Operator', sanction_status: 'Verified', wallet_address: operatorData.wallet_address };
            } else if (token === investorToken) {
                req.user = { id: investorUserId, role: 'Investor', sanction_status: 'Verified', wallet_address: investorData.wallet_address };
            } else if (token === errorUserToken) {
                req.user = { id: errorUserUserId, role: 'Investor', sanction_status: 'Pending', wallet_address: errorUserData.wallet_address };
            } else {
                req.user = null; // Simulate no token or invalid token
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, no token.' });
            }

            if (requiredRole && req.user.role !== requiredRole) {
                return res.status(403).json({ message: `Not authorized. ${requiredRole} role required.` });
            }

            next();
        }),
        initProtect: jest.fn(() => (req, res, next) => {
            req.user = { id: investorUserId, role: 'Investor' };
            next();
        }),
    }));

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(axios, 'get').mockResolvedValue({ data: { isSanctioned: false } });
    });

    beforeAll(async () => {
        app = (await import('../app.js')).default;
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

    
});