import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import initializeDatabase from './models/dbSetup.js';
import pool from './config/db.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());

// Routes
await initializeDatabase();
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT current_database()');
  res.send(`Connected to database: ${result.rows[0].current_database}`);
});
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http:localhost:${port}`);
});

