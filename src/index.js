// src/index.js
const express = require('express');
const searchRoutes = require('./api/search');

// Create an Express application
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port or default to 3000

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount the search API routes
app.use('/api', searchRoutes);

// Simple root route
app.get('/', (req, res) => {
  res.send('SSE Proxy Server is running.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
  // It's often recommended to gracefully shutdown the server in this case
  process.exit(1);
});
