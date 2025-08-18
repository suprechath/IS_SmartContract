// index.js (at the root)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

const userRoutes = require('./src/routes/userRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const investorRoutes = require('./src/routes/investorRoutes');

// A simple test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('CommEfficient Backend is running!');
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investor', investorRoutes);

module.exports = app;