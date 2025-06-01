const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware: Require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

 // GET /api/users - List all users (for assignment, etc.)
router.get('/', requireAuth, async (req, res) => {
  const users = await User.find({}, 'displayName email role _id');
  res.json({ users });
});

module.exports = router;
