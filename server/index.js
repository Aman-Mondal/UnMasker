const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const reportRoutes = require('./routes/reports');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Start server after database readiness check
async function startServer() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UnMasker] Node.js Express server running on http://127.0.0.1:${PORT}`);
  });
}
startServer();

// Robust exception handlers
process.on('uncaughtException', (err) => {
  console.error('[UnMasker Server] Uncaught Exception:', err.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UnMasker Server] Unhandled Rejection:', reason);
});

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'UnMasker MERN Server', port: PORT });
});

// Serve compiled React build if available
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  const indexHtml = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>UnMasker API Server</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>UnMasker MERN Backend Server</h2>
          <p>Status: Active on Port ${PORT}</p>
          <p>Python Analysis Service: Active on Port 5001</p>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[UnMasker] Node.js Express server running on http://127.0.0.1:${PORT}`);
});


