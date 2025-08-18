// index.js (at the root)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// A simple test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('CommEfficient Backend is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});