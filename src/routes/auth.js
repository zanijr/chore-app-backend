const express = require('express');
const passport = require('passport');

const router = express.Router();

// Start Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL + '/login',
    session: true,
  }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect(process.env.FRONTEND_URL);
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL + '/login');
  });
});

// Get current user info
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;
