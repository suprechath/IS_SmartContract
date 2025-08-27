import request from 'supertest';
import app from '../src/index.js';
import pool from '../src/config/db.js';
import initializeDatabase from '../src/models/dbSetup.js';
import { createUserAndLogin } from './testUtils.js';

describe('Project API', () => {

    beforeEach(async () => {
        await pool.query('TRUNCATE users_onchain, users_offchain, project_onchain, project_offchain, transactions RESTART IDENTITY CASCADE');
        await initializeDatabase();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('Unauthenticated routes', () => {
        it('GET /api/projects - should return a list of projects with default status', async () => {
            const res = await request(app).get('/api/projects');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('Authenticated routes', () => {
        let token;
        let user;

        beforeEach(async () => {
            const loginResult = await createUserAndLogin();
            token = loginResult.token;
            user = loginResult.user;
        });

        it('POST /api/projects - should create a new project', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Green Project',
                    project_overview: 'Overview of the project. This is a great project.',
                    location: 'New York, USA',
                    tags: ['green', 'energy'],
                    projected_roi: 15.5,
                    project_plan_url: 'http://example.com/plan.pdf',
                    funding_USDC_goal: 10000,
                    funding_duration_second: 2592000,
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe(201);
            expect(res.body.data).toHaveProperty('id');
        });
    });
});
