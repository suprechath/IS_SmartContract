import app from './app.js';
import initializeDatabase from './models/dbSetup.js';

const port = process.env.PORT || 3001;

// Start the server
const startServer = async () => {
  await initializeDatabase(); // Ensure DB is set up before listening
  app.listen(port, () => {
    console.log(`Server is running on http:localhost:${port}`);
  });
};

startServer();