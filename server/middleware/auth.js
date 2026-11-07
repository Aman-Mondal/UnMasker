const jwt = require('jsonwebtoken');
const UserDAO = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'unmasker-secure-jwt-secret-key-2026';

// Mandatory authentication middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserDAO.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }
};

// Optional authentication middleware (allows anonymous requests but tracks logged-in users)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserDAO.findById(decoded.id);
      if (user) req.user = user;
    } catch (_) {
      // Continue as guest
    }
  }
  next();
};

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
