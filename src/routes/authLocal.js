const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required.' });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      role,
      displayName: username,
    });
    res.status(201).json({ message: 'User registered', user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    // For simplicity, store user info in session (or you can return a JWT)
    req.session.userId = user._id;
    res.json({ message: 'Login successful', user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const user = await User.findById(req.session.userId).select('-password');
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ user });
});

module.exports = router;
