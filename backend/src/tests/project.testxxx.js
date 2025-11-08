import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import { on } from 'events';

dotenv.config();

describe('Projects Endpoints', () => {
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
            tokenContractAddress: '0xbc9D2D3BdB6e8533E8502a710563441a9bb5eb8F',
            managementContractAddress: '0x91f59acebD1543B9490CF39E6e96eAe79edbB101'
        };
    });

    describe('POST /api/projects', () => {
        it('should prevent non-Project Creator from creating a project', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${investorToken}`)
                .send({ ...projectData, title: "Sunset Villas Energy Upgrade" });
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('Not authorized. Project Creator role required.');
        });

        it('should fail to create project with missing title (validation)', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ ...projectData, title: "" });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('is not allowed to be empty');
        });

        it('should fail to create project with invalid funding goal (validation)', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ ...projectData, funding_USDC_goal: -5000 });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('must be a positive number');
        });

        it('should fail to create project with no token', async () => {
            const res = await request(app)
                .post('/api/projects')
                .send({ ...projectData, title: "Sunset Villas Energy Upgrade" });
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token.');
        });

        it('should allow Project Creator to create a project', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ ...projectData, title: "Sunset Villas Energy Upgrade" });
            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.usdc_contract_address).toBe(projectData.usdc_contract_address);
        });
    });

    describe('GET /api/projects', () => {
        it('should get all projects (public)', async () => {
            const res = await request(app).get('/api/projects');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(0);
            expect(res.body.data).toEqual([]);
        });

        it('should filter projects by status=Pending', async () => {
            const res = await request(app).get('/api/projects?status=Pending');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].project_status).toBe('Pending');
        });

        it('should return empty array for non-existent status=Active', async () => {
            const res = await request(app).get('/api/projects?status=Active');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual([]);
        });
    });

    describe('GET /api/projects/id/:projectId', () => {
        it('should prevent access without token', async () => {
            const res = await request(app)
                .get(`/api/projects/id/${testProjectId1}`);
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token.');
        });

        it('should allow access with valid token', async () => {
            const res = await request(app)
                .get(`/api/projects/id/${testProjectId1}`)
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('onchain_id', testProjectId1);
        });

        it('should return 404 for non-existent project', async () => {
            const res = await request(app)
                .get(`/api/projects/id/00000000-0000-0000-0000-000000000000`)
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('Project not found');
        });
    });

    describe('PATCH /api/projects/id/:projectId', () => {
        it('should prevent non-Project Creator from updating a project', async () => {
            const res = await request(app)
                .patch(`/api/projects/id/${testProjectId1}`)
                .set('Authorization', `Bearer ${investorToken}`)
                .send({ location: "New Location, NY, USA" });
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('Not authorized. Project Creator role required.');
        });

        it('should allow Project Creator to update their project', async () => {
            const res = await request(app)
                .patch(`/api/projects/id/${testProjectId1}`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ location: "New Location, NY, USA" });
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.location).toBe("New Location, NY, USA");
        });

        it('should return 404 when updating non-existent project', async () => {
            const res = await request(app)
                .patch(`/api/projects/id/00000000-0000-0000-0000-000000000000`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ location: "Nowhere" });
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('Project not found');
        });

        it('should fail to update project with invalid projected ROI (validation)', async () => {
            const res = await request(app)
                .patch(`/api/projects/id/${testProjectId1}`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({ projected_roi: -10 });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('must be a positive number');
        });

        it('should fail to update project with no token', async () => {
            const res = await request(app)
                .patch(`/api/projects/id/${testProjectId1}`)
                .send({ location: "No Token Location" });
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token.');
        });
    });

    describe('GET /api/projects/my', () => {
        it('should allow Project Creator to get their projects', async () => {
            const res = await request(app)
                .get('/api/projects/my')
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
            expect(res.body.data[0]).toHaveProperty('user_onchain_id');
        });

        it('should prevent non-Project Creator from accessing /my projects', async () => {
            const res = await request(app)
                .get('/api/projects/my')
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('Not authorized. Project Creator role required.');
        });

        it('should prevent access to /my projects without token', async () => {
            const res = await request(app)
                .get('/api/projects/my');
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token.');
        });
    });

    describe('GET /api/projects/myInvestments', () => {
        it('should allow Investor to get their investments', async () => {
            const res = await request(app)
                .get('/api/projects/myInvestments')
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        it('should prevent non-Investor from accessing /myInvestments', async () => {
            const res = await request(app)
                .get('/api/projects/myInvestments')
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('Not authorized. Investor role required.');
        });

        it('should prevent access to /myInvestments without token', async () => {
            const res = await request(app)
                .get('/api/projects/myInvestments');
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token.');
        });
    });

    describe('GET /api/projects/ids', () => {
        it('should get all project IDs (public)', async () => {
            const res = await request(app).get('/api/projects/ids');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
            expect(res.body.data[0]).toHaveProperty('id');
        });
    });

    describe('GET /api/projects/onchain/id/:projectId', () => {
        it('should get onchain project IDs for a given project (protected)', async () => {
            const res = await request(app)
                .get(`/api/projects/onchain/id/${testProjectId1}`)
                .set('Authorization', `Bearer ${investorToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('id', testProjectId1);
        });

        it('should prevent access without token', async () => {
            const res = await request(app)
                .get(`/api/projects/onchain/id/${testProjectId1}`);
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token.');
        });
    });

    describe('Project Onchain Deployment Flow', () => {

        describe('POST /api/projects/deploy/onchain', () => {
            it('should prevent non-Project Creator from preparing onchain deployment', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onchain')
                    .set('Authorization', `Bearer ${investorToken}`)
                    .send({ projectId: testProjectId1, factoryAddress: '0xFbd531f997d5da621484f7b3f5af744b0bc4b18b' });
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toBe('Not authorized. Project Creator role required.');
            });

            it('should prevent the absent factory address', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onchain')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ projectId: testProjectId1 });
                expect(res.statusCode).toEqual(503);
                expect(res.body.message).toContain('ProjectFactory address');
            });

            describe('Record factory contract', () => {
                beforeAll(async () => {
                    const factorydata = {
                        factoryAddress: '0xfbd531f997d5da621484f7b3f5af744b0bc4b18b'
                    };
                    const deployData = {
                        recordKey: 'MOCK_USDC_CONTRACT_ADDRESS',
                        address: '0x97886a3357c8829539978cf45de688250c91b338'
                    };
                    const res1 = await request(app)
                        .post('/api/admin/deploy-factory/record')
                        .set('Authorization', `Bearer ${operatorToken}`)
                        .send(factorydata);
                    expect(res1.statusCode).toEqual(200);
                    const res2 = await request(app)
                        .post('/api/admin/deploy/record')
                        .set('Authorization', `Bearer ${operatorToken}`)
                        .send(deployData);
                    expect(res2.statusCode).toEqual(200);
                });

                it('should not allow preparing onchain deployment for unregistered project', async () => {
                    const res = await request(app)
                        .post('/api/projects/deploy/onchain')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: '00000000-0000-0000-0000-000000000000' });
                    expect(res.statusCode).toEqual(404);
                    expect(res.body.message).toContain('Project not found');
                });

                it('should not allow preparing onchain deployment for unapproved project', async () => {
                    const res = await request(app)
                        .post('/api/projects/deploy/onchain')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId2 });
                    expect(res.statusCode).toEqual(400);
                    expect(res.body.message).toContain('Approved');
                });

                it('should prevent other creators from preparing onchain deployment', async () => {
                    const resApprove = await request(app)
                        .post('/api/admin/projects/review')
                        .set('Authorization', `Bearer ${operatorToken}`)
                        .send({ projectId: testProjectId1, status: 'Approved' });
                    expect(resApprove.statusCode).toEqual(200);
                    const res = await request(app)
                        .post('/api/projects/deploy/onchain')
                        .set('Authorization', `Bearer ${creatorToken2}`)
                        .send({ projectId: testProjectId1 });
                    expect(res.statusCode).toEqual(403);
                    expect(res.body.message).toContain('Not authorized');
                });

                it('should allow Project Creator to prepare onchain deployment', async () => {
                    const res = await request(app)
                        .post('/api/projects/deploy/onchain')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId1 });
                    expect(res.statusCode).toEqual(200);
                    expect(res.body.data).toHaveProperty('unsignedTx');
                    expect(res.body.data.unsignedTx.to).toBe("0xfbd531f997d5da621484f7b3f5af744b0bc4b18b"); // Check owner

                });

                it('should fail to prepare onchain deployment with DB error', async () => {
                    const mockError = new Error('Simulated database failure');
                    const spy = jest.spyOn(userModel, 'getUserById').mockRejectedValue(mockError);
                    // Simulate DB error by providing invalid projectId format
                    const res = await request(app)
                        .post('/api/projects/deploy/onchain')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId1 });
                    expect(res.statusCode).toEqual(500);
                    expect(res.body.message).toContain('Server error');
                    spy.mockRestore();
                });
            });



        });

        describe('POST /api/projects/deploy/onboard', () => {

            it('should prevent non-Project Creator from onboarding project', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${investorToken}`)
                    .send(onboardData);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toBe('Not authorized. Project Creator role required.');
            });
            it('should prevent the absent onchain project address', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ projectId: testProjectId1 });
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('is required');
            });
            it('should prevent onboarding for unregistered project', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ ...onboardData, projectId: '00000000-0000-0000-0000-000000000000' });
                expect(res.statusCode).toEqual(404);
                expect(res.body.message).toContain('Project not found');
            });
            it('should prevent onboarding for unapproved project', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ ...onboardData, projectId: testProjectId2 });
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('Approved');
            });
            it('should prevent other creators from onboarding project', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken2}`)
                    .send(onboardData);
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toContain('not the creator of this project');
            });
            it('should allow Project Creator to onboard project', async () => {
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send(onboardData);
                expect(res.statusCode).toEqual(200);
                expect(res.body.data).toHaveProperty('user_onchain_id', creatorUserId);
                expect(res.body.data).toHaveProperty('management_contract_address', onboardData.managementContractAddress);
            });
            it('should prevent double onboarding on the same project', async () => {
                const mockProject = {
                    id: onboardData.projectId,
                    user_onchain_id: creatorUserId,
                    project_status: 'Approved',
                    token_contract_address: "0xbc9D2D3BdB6e8533E8502a710563441a9bb5eb8F"
                };
                const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockResolvedValue(mockProject);

                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send(onboardData);
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('already been recorded');
                spy.mockRestore();
            });
            it('should fail to onboard project with DB error', async () => {
                const mockError = new Error('Simulated database failure');
                const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockRejectedValue(mockError);
                const res = await request(app)
                    .post('/api/projects/deploy/onboard')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send(onboardData);
                expect(res.statusCode).toEqual(500);
                expect(res.body.message).toContain('Server error');
                spy.mockRestore();
            });
        });

        describe('POST /api/projects/mint/prepare', () => {
            it('should prevent non-Project Creator from preparing minting', async () => {
                const res = await request(app)
                    .post('/api/projects/mint/prepare')
                    .set('Authorization', `Bearer ${investorToken}`)
                    .send({ projectId: testProjectId1, batchLimit: 2 });
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toBe('Not authorized. Project Creator role required.');
            });

            it('should prevent the absent batch limit', async () => {
                const res = await request(app)
                    .post('/api/projects/mint/prepare')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ projectId: testProjectId1 });
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('is required');
            });

            it('should prevent preparing minting for unregistered project', async () => {
                const res = await request(app)
                    .post('/api/projects/mint/prepare')
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ projectId: '00000000-0000-0000-0000-000000000000', batchLimit: 2 });
                expect(res.statusCode).toEqual(404);
                expect(res.body.message).toContain('Project not found');
            });

            describe('After funding achieved', () => {
                beforeAll(async () => {
                    const result = await projectModel.updateProject(testProjectId1, { project_status: 'Succeeded' }, {});
                    console.log("Updated project status to Succeeded:", result);
                });

                it('should prevent preparing minting for non-succeeded project', async () => {
                    const res = await request(app)
                        .post('/api/projects/mint/prepare')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId2, batchLimit: 2 });
                    expect(res.statusCode).toEqual(400);
                    expect(res.body.message).toContain('Succeeded');
                });

                it('should prevent non-deployed project from preparing minting', async () => {
                    mockProject = {
                        id: testProjectId1,
                        user_onchain_id: creatorUserId,
                        project_status: 'Succeeded',
                        token_contract_address: "0xbc9D2D3BdB6e8533E8502a710563441a9bb5eb8F"
                    };
                    const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockResolvedValue(mockProject);
                    const res = await request(app)
                        .post('/api/projects/mint/prepare')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId1, batchLimit: 2 });
                    expect(res.statusCode).toEqual(400);
                    expect(res.body.message).toContain('Project management contract');
                    spy.mockRestore();
                });

                it('should prevent double minting project token', async () => {
                    mockProject = {
                        id: testProjectId1,
                        user_onchain_id: creatorUserId,
                        project_status: 'Succeeded',
                        token_contract_address: "0xbc9D2D3BdB6e8533E8502a710563441a9bb5eb8F",
                        management_contract_address: "0x91f59acebD1543B9490CF39E6e96eAe79edbB101",
                        tokens_minted: true
                    };
                    const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockResolvedValue(mockProject);
                    const res = await request(app)
                        .post('/api/projects/mint/prepare')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId1, batchLimit: 2 });
                    expect(res.statusCode).toEqual(400);
                    expect(res.body.message).toContain('already been minted');
                    spy.mockRestore();
                });

                it('should allow Project Creator to prepare minting', async () => {
                    const res = await request(app)
                        .post('/api/projects/mint/prepare')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId1, batchLimit: 2 });
                    expect(res.statusCode).toEqual(200);
                    expect(res.body.data).toHaveProperty('unsignedTx');
                    expect(res.body.data.unsignedTx.to).toContain(onboardData.managementContractAddress); // Check to address
                });

                it('should fail to prepare minting with DB error', async () => {
                    const mockError = new Error('Simulated database failure');
                    const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockRejectedValue(mockError);
                    const res = await request(app)
                        .post('/api/projects/mint/prepare')
                        .set('Authorization', `Bearer ${creatorToken}`)
                        .send({ projectId: testProjectId1, batchLimit: 2 });
                    expect(res.statusCode).toEqual(500);
                    expect(res.body.message).toContain('Server error');
                    spy.mockRestore();
                });
            });
        });

        describe('POST /api/projects/:id/confirm-mint', () => {
            it('should prevent non-Project Creator from confirming minting', async () => {
                const res = await request(app)
                    .post(`/api/projects/${testProjectId1}/confirm-mint`)
                    .set('Authorization', `Bearer ${investorToken}`)
                    .send({ transactionHash: '0x6831345b75eb22b88bba6bab4b4b7ad98f752b14370e5e33ed8b9662731ec5fc' });
                expect(res.statusCode).toEqual(403);
                expect(res.body.message).toBe('Not authorized. Project Creator role required.');
            });

            it('should prevent the invalid transaction hash ', async () => {
                const res = await request(app)
                    .post(`/api/projects/${testProjectId1}/confirm-mint`)
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ transactionHash: '0x6831345b75eb22b88bba6bab4b4b7ad98f752b14370e5e33ed8b9662731ec5ab' });
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('not found');
            });

            it('should prevent confirming minting for unregistered project', async () => {
                const res = await request(app)
                    .post(`/api/projects/00000000-0000-0000-0000-000000000000/confirm-mint`)
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ transactionHash: '0x6831345b75eb22b88bba6bab4b4b7ad98f752b14370e5e33ed8b9662731ec5fc' });
                expect(res.statusCode).toEqual(404);
                expect(res.body.message).toContain('Project not found');
            });

            it('should allow Project Creator to confirm minting, but have not finished yet', async () => {
                const res = await request(app)
                    .post(`/api/projects/${testProjectId1}/confirm-mint`)
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ transactionHash: '0xe39dc7d6fc271f03d502e08e3429030aa40439bbb9874f887c852016619e9083' });
                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toContain('not been finished yet');
            });

            it('should allow Project Creator to confirm minting successfully', async () => {
                const res = await request(app)
                    .post(`/api/projects/${testProjectId1}/confirm-mint`)
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ transactionHash: '0x6831345b75eb22b88bba6bab4b4b7ad98f752b14370e5e33ed8b9662731ec5fc' });
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('confirmed and recorded');
            });

            it('should fail to confirm minting with DB error', async () => {
                const mockError = new Error('Simulated database failure');
                const spy = jest.spyOn(projectModel, 'getOnchainProjectById').mockRejectedValue(mockError);
                const res = await request(app)
                    .post(`/api/projects/${testProjectId1}/confirm-mint`)
                    .set('Authorization', `Bearer ${creatorToken}`)
                    .send({ transactionHash: '0x6831345b75eb22b88bba6bab4b4b7ad98f752b14370e5e33ed8b9662731ec5fc' });
                expect(res.statusCode).toEqual(500);
                expect(res.body.message).toContain('Server error');
                spy.mockRestore();
            });

        });


        describe('POST /api/projects/:id/sync', () => {
            it('should prevent access without token', async () => {
                const res = await request(app)
                    .post(`/api/projects/${testProjectId1}/sync`);
                expect(res.statusCode).toEqual(401);
                expect(res.body.message).toBe('Not authorized, no token.');
            });

            it('should prevent syncing from unregistered project', async () => {
                const res = await request(app)
                    .post(`/api/projects/00000000-0000-0000-0000-000000000000/sync`)
                    .set('Authorization', `Bearer ${investorToken}`);
                expect(res.statusCode).toEqual(404);
                expect(res.body.message).toContain('Project not found');
            });
        });
    });
});
