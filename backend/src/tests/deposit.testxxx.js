import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import { on } from 'events';

dotenv.config();

describe('Deposit Endpoints', () => {
    let app;
    let investorToken, operatorToken, creatorToken, errorUserToken;
    let investorUserId, operatorUserId, creatorUserId, errorUserUserId;
    let testProjectId1, testProjectId2;
    let onboardData

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

    const projectData = {
        title: "Apex Tower Smart Retrofit",
        location: "San Francisco, CA, USA",
        tags: ["Energy Efficiency"],
        projected_roi: 8,
        project_plan_url: "https://example.com/docs/apex-tower-project-plan.pdf",
        funding_USDC_goal: 2000000,
        funding_duration_second: 7776000,
        platform_fee_percentage: 500,
        reward_fee_percentage: 300,
        usdc_contract_address: "0x97886a3357c8829539978cf45de688250c91b338"
    };

    const createToken = (id, role) => {
        return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    };

    jest.unstable_mockModule('../middlewares/authMiddleware.js', () => ({
        protect: jest.fn((requiredRole) => (req, res, next) => {
            const token = req.headers.authorization?.split(' ')[1];
            if (token === operatorToken) {
                req.user = { id: operatorUserId, role: 'Platform Operator', sanction_status: 'Verified', wallet_address: operatorData.wallet_address };
            } else if (token === creatorToken) {
                req.user = { id: creatorUserId, role: 'Project Creator', sanction_status: 'Verified', wallet_address: creatorData.wallet_address };
            } else if (token === creatorToken2) {
                req.user = { id: creatorUserId2, role: 'Project Creator', sanction_status: 'Verified', wallet_address: "0x4444444444444444444444444444444444444444" };
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

        const creatorRes2 = await request(app)
            .post('/api/users/register')
            .send({ ...creatorData, full_name: 'Test Creator 2', email: 'creator2@example.com', identification_number: 'ID_CREATOR_124', wallet_address: '0x4444444444444444444444444444444444444444' });
        creatorUserId2 = creatorRes2.body.data.id;
        creatorToken2 = createToken(creatorUserId2, creatorData.role);

        const createdProject1 = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send(projectData);
        testProjectId1 = createdProject1.body.data.id;

        const createdProject2 = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({ ...projectData, title: "Green Heights Retrofit" });
        testProjectId2 = createdProject2.body.data.id;

        onboardData = {
            projectId: testProjectId1,
            user_onchain_id: creatorUserId,
            usdc_contract_address: '0xBFC40D282290c58CD5DB476cC70006f7Db209270',
            management_contract_address: '0x55b3F35035C96BC7B654b33eb6264e390Bc41614',
            project_status: 'Active',
        };
    });

    describe('POST /api/deposits', () => {
        it('should not allow deposit if user is not valid', async () => {
            const res = await request(app)
                .post('/api/deposits')
                .set('Authorization', `Bearer ${investorToken}`)
                .send({
                    projectId: testProjectId1,
                    amount: 1000,
                });
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toContain('Not authorized');
        });

        it('should prevent invalid amount deposits', async () => {
            const res = await request(app)
                .post('/api/deposits')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                    projectId: testProjectId1,
                    amount: -1000,
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('must be');
        });

        it('should prevent deposits to non-existent projects', async () => {
            const res = await request(app)
                .post('/api/deposits')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                    projectId: '00000000-0000-0000-0000-000000000000',
                    amount: 1000,
                });
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('not found');
        });

        it('should not allow deposit if user is another creator', async () => {
            const res = await request(app)
                .post('/api/deposits')
                .set('Authorization', `Bearer ${creatorToken2}`)
                .send({
                    projectId: testProjectId1,
                    amount: 1000,
                });
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toContain('not authorized');
        });
        it('should prevent deposit if the project status is not active', async () => {
            const res = await request(app)
                .post('/api/deposits')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                    projectId: testProjectId2,
                    amount: 1000,
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Active');
        });

        it('should allow valid deposits by the project creator', async () => {
            const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockResolvedValue(onboardData);
            const res = await request(app)
                .post('/api/deposits')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                    projectId: testProjectId1,
                    amount: 1000,
                });
            console.log("asdasd",res.body);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('unsignedTx');
            expect(res.body.data.amount).toEqual("1000");
            spy.mockRestore();
        });
    });
});
