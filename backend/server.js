require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const User = require('./models/User');

const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const admissionRoutes = require('./routes/admissionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admissions', admissionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'College Admission Management Portal API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist build if present
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root welcome fallback
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: system-ui, sans-serif; text-align: center; padding: 40px;">
        <h2>🎓 ABES Engineering College - Admission Portal Backend API</h2>
        <p>API Server is running smoothly on port ${PORT}.</p>
        <p>Frontend client communicates with: <code>/api/auth</code> and <code>/api/admissions</code></p>
      </div>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await User.seedDemoIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Admission Portal Backend running at http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const altPort = Number(PORT) + 1;
        console.warn(`⚠️ Port ${PORT} is in use, attempting port ${altPort}...`);
        app.listen(altPort, () => {
          console.log(`🚀 Admission Portal Backend running at http://localhost:${altPort}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
  }
};

startServer();
