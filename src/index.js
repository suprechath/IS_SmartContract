import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import initializeDatabase from './models/dbSetup.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Ensure database connection is established
import pool from './config/db.js';
import { handleResponse } from './utils/responseHandler.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());

// Routes
await initializeDatabase();
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT current_database()');
  handleResponse(res, 200, `Connected to database: ${result.rows[0].current_database}`, { database: result.rows[0].current_database });
});
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http:localhost:${port}`);
});

