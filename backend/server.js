const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = async () => {
  const cdb = require('./config/db');
  await cdb();
};

// 1. Load Environment Variables
dotenv.config();

// Initialize Express
const app = express();

// 2. Middleware Configuration
app.use(cors({
  origin: '*', // Enable full access for local/react demo connections
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Router Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scrap', require('./routes/scrapRoutes'));

// 4. Default Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Scrap Metal Management System API',
    status: 'online',
    version: '1.0.0',
    developer: 'Antigravity AI Integration'
  });
});

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('--- [SERVER ERROR DETECTED] ---');
  console.error(err.stack);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// 6. Connect Database & Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('--- Starting Scrap Metal Management System Backend ---');
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`--- [SERVER ACTIVE] Running in ${process.env.NODE_ENV} mode on Port: ${PORT} ---`);
    console.log(`--- API endpoints active: http://localhost:${PORT}/api ---`);
  });
};

startServer();