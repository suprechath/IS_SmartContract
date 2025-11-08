import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

describe('Admin Endpoints', () => {
    let app;
    let investorToken, operatorToken, creatorToken, errorUserToken;
    let investorUserId, operatorUserId, creatorUserId, errorUserUserId;
    let testProjectId1, testProjectId2;

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
        usdc_contract_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
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
    });

    describe('POST /api/admin/verify-user', () => {
        it('should allow Platform Operator to verify a user', async () => {
            const res = await request(app)
                .post('/api/admin/verify-user')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ id: investorUserId, sanction_status: 'Verified' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('User status successfully updated');
            expect(res.body.data.sanction_status).toBe('Verified');
        });

        it('should forbid non-operator from verifying a user', async () => {
            const res = await request(app)
                .post('/api/admin/verify-user')
                .set('Authorization', `Bearer ${investorToken}`)
                .send({ id: investorUserId, sanction_status: 'Verified' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toContain('Not authorized');
        });

        it('should return 400 if user ID or status is missing', async () => {
            const res = await request(app)
                .post('/api/admin/verify-user')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ id: investorUserId });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('User ID and status are required.');
        });

        it('should return 404 if user not found', async () => {
            const nonExistentId = "a32d7f5e-469f-486b-b84e-7386adb50108";
            const res = await request(app)
                .post('/api/admin/verify-user')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ id: nonExistentId, sanction_status: 'Verified' });
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('User not found.');
        });
    });

    describe('POST /api/admin/projects/review', () => {

        it('should forbid non-operator from reviewing a project', async () => {
            const res = await request(app)
                .post('/api/admin/projects/review')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ projectId: testProjectId1, status: 'Approved' });
            expect(res.statusCode).toEqual(403);
        });

        it('should return 400 for invalid status', async () => {
            const res = await request(app)
                .post('/api/admin/projects/review')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ projectId: testProjectId1, status: 'InvalidStatus' });
            expect(res.statusCode).toEqual(400); // Validation middleware
            expect(res.body.message).toContain('must be one of');
        });

        it('should return 404 if project not found', async () => {
            const nonExistentId = "06c3db78-6008-4954-83c6-09b20811564c";
            const res = await request(app)
                .post('/api/admin/projects/review')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ projectId: nonExistentId, status: 'Approved' });
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Project not found.');
        });

        it('should allow Platform Operator to approve a project', async () => {
            const res = await request(app)
                .post('/api/admin/projects/review')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ projectId: testProjectId1, status: 'Approved' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('Project status updated to Approved');
            expect(res.body.data.project_status).toBe('Approved');
        });

        it('should allow Platform Operator to reject a project', async () => {
            const res = await request(app)
                .post('/api/admin/projects/review')
                .set('Authorization', `Bearer ${operatorToken}`)
                .send({ projectId: testProjectId2, status: 'Rejected' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.project_status).toBe('Rejected');
        });
    });

    describe('Admin Configuration and Deployment Endpoints', () => {
        describe('GET /api/admin/configs', () => {
            it('should allow all users to get all configurations', async () => {
                const res = await request(app)
                    .get('/api/admin/configs');
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('All configuration values retrieved successfully.');
                expect(Array.isArray(res.body.data)).toBe(true);
            });
        });

        describe('POST /api/admin/deploy-factory/prepare', () => {
            it('should allow Platform Operator to prepare factory deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-factory/prepare')
                    .set('Authorization', `Bearer ${operatorToken}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('Unsigned factory deployment transaction prepared successfully.');
                expect(res.body.data).toHaveProperty('unsignedTx');
            });

            it('should forbid non-operator from preparing factory deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-factory/prepare')
                    .set('Authorization', `Bearer ${creatorToken}`);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toContain('Not authorized');
            });

            it('should forbid preparing factory deployment if already configured', async () => {
                const deployData = {
                    factoryAddress: '0x97886a3357C8829539978cF45de688250C91B338'
                };
                await request(app)
                    .post('/api/admin/deploy-factory/record')
                    .set('Authorization', `Bearer ${operatorToken}`)
                    .send(deployData);
                const res = await request(app)
                    .post('/api/admin/deploy-factory/prepare')
                    .set('Authorization', `Bearer ${operatorToken}`);
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('A ProjectFactory contract address is already configured');
            });
        });

        describe('POST /api/admin/deploy-factory/record', () => {
            const deployData = {
                factoryAddress: '0x48FD74B6E44cA7DC897F92028b3be6D5A8F53cC7'
            };
            it('should allow Platform Operator to record factory deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-factory/record')
                    .set('Authorization', `Bearer ${operatorToken}`)
                    .send(deployData);
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('Factory address has been successfully recorded and is now active.');
                expect(res.body.data.recordedConfig.config_value).toBe(deployData.factoryAddress);
            });

            it('should forbid non-operator from recording factory deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-factory/record')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send(deployData);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toContain('Not authorized');
            });

            it('should return 400 if required fields are missing', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-factory/record')
                    .set('Authorization', `Bearer ${operatorToken}`)
                    .send({ factoryAddress: '0xFactoryAddress123' });
                expect(res.statusCode).toEqual(400);
            });
        });

        describe('POST /api/admin/deploy-mUSDC/prepare', () => {
            it('should allow Platform Operator to prepare mUSDC deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-mUSDC/prepare')
                    .set('Authorization', `Bearer ${operatorToken}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('Unsigned factory deployment transaction prepared successfully.');
                expect(res.body.data).toHaveProperty('unsignedTx');
            });

            it('should forbid non-operator from preparing mUSDC deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy-mUSDC/prepare')
                    .set('Authorization', `Bearer ${creatorToken}`);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toContain('Not authorized');
            });

            it('should forbid preparing mUSDC deployment if already configured', async () => {
                const deployData = {
                    recordKey: 'MOCK_USDC_CONTRACT_ADDRESS',
                    address: '0x97886a3357C8829539978cF45de688250C91B338'
                };
                const res1 = await request(app)
                    .post('/api/admin/deploy/record')
                    .set('Authorization', `Bearer ${operatorToken}`)
                    .send(deployData);
                const res = await request(app)
                    .post('/api/admin/deploy-mUSDC/prepare')
                    .set('Authorization', `Bearer ${operatorToken}`);
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('A mUSDC contract address is already configured');
            });
        });

        describe('POST /api/admin/deploy/record', () => {
            const deployData = {
                recordKey: 'MOCK_USDC_CONTRACT_ADDRESS',
                address: '0x48FD74B6E44cA7DC897F92028b3be6D5A8F53cC7'
            };
            it('should allow Platform Operator to record mUSDC deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy/record')
                    .set('Authorization', `Bearer ${operatorToken}`)
                    .send(deployData);
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('Address has been successfully recorded and is now active.');
                expect(res.body.data.updatedConfig.config_value).toBe(deployData.address);
            });

            it('should forbid non-operator from recording mUSDC deployment', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy/record')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send(deployData);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toContain('Not authorized');
            });
            it('should return 400 if required fields are missing', async () => {
                const res = await request(app)
                    .post('/api/admin/deploy/record')
                    .set('Authorization', `Bearer ${operatorToken}`)
                    .send({ });
                expect(res.statusCode).toEqual(400);
            });
        });

        describe('PATCH /api/admin/configs/:configKey', () => {
            it('should allow Platform Operator to delete a config value', async () => {
                const res = await request(app)
                    .patch('/api/admin/configs/FUNDING_FEE')
                    .set('Authorization', `Bearer ${operatorToken}`);
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('deleted successfully');
                expect(res.body.data.config_value).toBeNull();
            });
            it('should forbid non-operator from deleting a config value', async () => {
                const res = await request(app)
                    .patch('/api/admin/configs/FUNDING_FEE')
                    .set('Authorization', `Bearer ${creatorToken}`);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toContain('Not authorized');
            });
            it('should return 404 if config key not found', async () => {
                const res = await request(app)
                    .patch('/api/admin/configs/NON_EXISTENT_KEY')
                    .set('Authorization', `Bearer ${operatorToken}`);
                expect(res.statusCode).toEqual(404);
                expect(res.body.message).toBe('Configuration key not found.');
            });
        });
    });
});
