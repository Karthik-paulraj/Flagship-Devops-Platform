const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const mongoStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// @desc    Health check & Mongo connection status
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  const stateCode = mongoose.connection.readyState;
  const mongoStatus = mongoStateMap[stateCode] || 'unknown';
  const isHealthy = stateCode === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      provider: 'MongoDB',
      status: mongoStatus,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
  });
});

module.exports = router;
