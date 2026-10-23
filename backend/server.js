require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuration from environment variables (.env)
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'Deployment Test API';
const MESSAGE = process.env.MESSAGE || 'Default greeting from backend';
const API_KEY = process.env.API_KEY || '';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files if hosted together
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeEnv: NODE_ENV
  });
});

app.get('/api/config', (req, res) => {
  // Safe representation of env variables for deployment verification
  res.json({
    status: 'success',
    source: 'backend/.env',
    appName: APP_NAME,
    message: MESSAGE,
    nodeEnv: NODE_ENV,
    port: PORT,
    hasApiKey: Boolean(API_KEY),
    maskedApiKey: API_KEY ? `${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}` : 'Not set',
    serverTime: new Date().toISOString()
  });
});

app.post('/api/echo', (req, res) => {
  res.json({
    message: 'Echo response from backend',
    receivedData: req.body,
    receivedAt: new Date().toISOString(),
    envAppName: APP_NAME
  });
});

// Fallback to index.html for frontend routing if requested
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In case frontend isn't bundled together with backend
      res.json({
        service: APP_NAME,
        status: 'running',
        message: MESSAGE,
        documentation: {
          healthCheck: '/api/health',
          envConfig: '/api/config',
          echoTest: 'POST /api/echo'
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ${APP_NAME} is running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`💬 Message: "${MESSAGE}"`);
  console.log(`🔑 API Key Loaded: ${API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
