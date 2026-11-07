const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserDAO = require('../models/User');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = await UserDAO.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserDAO.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id || user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: `Registration failed: ${err.message}` });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await UserDAO.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id || user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: `Login failed: ${err.message}` });
  }
});

// Current user profile & Brave-style statistics
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
