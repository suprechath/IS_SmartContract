import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env.test if in test environment, otherwise .env
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

import initializeDatabase from './models/dbSetup.js';
import pool from './config/db.js'; // Your modified db config
import { handleResponse } from './utils/responseHandler.js';

// Import all your routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sanctionRoutes from './routes/sanctionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import depositRoutes from './routes/depositRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
await initializeDatabase();

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database()');
    handleResponse(res, 200, `Connected to database: ${result.rows[0].current_database}`, { database: result.rows[0].current_database });
  } catch (err) {
    handleResponse(res, 500, 'Database connection error', null, err.message);
  }
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sanctions', sanctionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/deposits', depositRoutes);

export default app;