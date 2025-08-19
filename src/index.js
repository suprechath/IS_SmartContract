import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import initializeDatabase from './models/dbSetup.js';
import pool from './config/db.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());

// Routes


//Create user table if it doesn't exist
await initializeDatabase();
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT current_database()');
  res.send(`Connected to database: ${result.rows[0].current_database}`);
});

// A simple test route to confirm the server is running
// app.get('/', (req, res) => {
//   res.send('CommEfficient Backend is running!');
// });

app.listen(port, () => {
  console.log(`Server is running on http:localhost:${port}`);
});

