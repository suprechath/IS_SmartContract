import { createUserAndLogin } from './testUtils.js';
import pool from '../src/config/db.js';
import initializeDatabase from '../src/models/dbSetup.js';


describe('Auth API', () => {

    beforeEach(async () => {
        await pool.query('TRUNCATE users_onchain, users_offchain RESTART IDENTITY CASCADE');
        await initializeDatabase(); // re-seed admin
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('Login Flow', () => {
        it('should create a user and then log them in', async () => {
            const { token } = await createUserAndLogin();
            expect(token).toBeDefined();
        });
    });
});
