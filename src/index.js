import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import initializeDatabase from './models/dbSetup.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sanctionRoutes from './routes/sanctionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';

// import rewardRoutes from './routes/rewardRoutes.js';
// import refundRoutes from './routes/refundRoutes.js';
// import withdrawalRoutes from './routes/withdrawalRoutes.js';


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
app.use('/api/admin', adminRoutes);
app.use('/api/sanctions', sanctionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
// app.use('/api/rewards', rewardRoutes);
// app.use('/api/refunds', refundRoutes);
// app.use('/api/withdrawals', withdrawalRoutes);


// Start the server
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http:localhost:${port}`);
    });
}

export default app;

