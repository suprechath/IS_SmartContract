// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const pool = require('./config/db.js');
// import dotenv from 'dotenv';
// dotenv.config();
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';


const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(express.json());
app.use(cors());

//routes

//Error handling middleware

//Test pg connection
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT current_database()');
  res.send(`Connected to database: ${result.rows[0].current_database}`);
});

//Server running
app.listen(PORT, () => {
  console.log(`Server is running on http:localhost:${PORT}`);
});