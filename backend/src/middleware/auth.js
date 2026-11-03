const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { memoryUsers } = require('../seed/productsData');

// Protect routes - require valid JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, please provide a token',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'flagship_ecommerce_jwt_super_secret_key_2026'
    );

    // If MongoDB is not connected, use memoryUsers store
    if (mongoose.connection.readyState !== 1) {
      const rawUser = memoryUsers.find((u) => u._id === decoded.id) || {
        _id: decoded.id,
        name: 'Demo User',
        email: 'user@example.com',
        role: 'user',
      };
      // eslint-disable-next-line no-unused-vars
      const { password: _pw, ...safeUser } = rawUser;
      req.user = safeUser;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
  }
};

// Admin role check
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required',
    });
  }
};

module.exports = { protect, admin };
