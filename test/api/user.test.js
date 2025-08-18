const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index'); // The refactored app
const { cleanDb } = require('../test-helper');

describe('User API endpoints', () => {

    beforeEach(async () => {
        await cleanDb();
    });

    after(async () => {
        await cleanDb();
    });

    describe('POST /api/users/register', () => {
        it('should register a new user with valid data', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'Investor'
            };

            const res = await request(app)
                .post('/api/users/register')
                .send(userData)
                .expect(201);

            expect(res.body).to.be.an('object');
            expect(res.body.message).to.equal('User registered successfully');
            expect(res.body.user).to.include({
                username: 'testuser',
                email: 'test@example.com',
                role: 'Investor'
            });
            expect(res.body.user).to.not.have.property('password_hash');
        });

        it('should fail to register a user with a duplicate email', async () => {
            const userData = {
                username: 'testuser1',
                email: 'test@example.com',
                password: 'password123',
                role: 'Investor'
            };
            // First registration
            await request(app).post('/api/users/register').send(userData);

            // Second registration with same email
            const secondUserData = { ...userData, username: 'testuser2' };
            const res = await request(app)
                .post('/api/users/register')
                .send(secondUserData)
                .expect(409);

            expect(res.body.message).to.equal('Email already in use.');
        });

        it('should fail with invalid data (e.g., short password)', async () => {
             const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123',
                role: 'Investor'
            };

            const res = await request(app)
                .post('/api/users/register')
                .send(userData)
                .expect(400);

            expect(res.body.message).to.equal('Validation error');
        });
    });
});
