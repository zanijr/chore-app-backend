const express = require('express');
const Chore = require('../models/Chore');
const User = require('../models/User');
const router = express.Router();

// Middleware: Require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

// Middleware: Load user and attach to req.user
async function attachUser(req, res, next) {
  if (!req.session.userId) return next();
  req.user = await User.findById(req.session.userId);
  next();
}

// GET /api/chores - List chores (optionally filter by status, assignedTo, etc.)
router.get('/', requireAuth, attachUser, async (req, res) => {
  const { status, assignedTo, createdBy } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (createdBy) filter.createdBy = createdBy;
  // Only show chores user is allowed to see
  if (req.user.role === 'child') {
    filter.$or = [
      { assignedTo: req.user._id },
      { assignedTo: null }
    ];
  }
  const chores = await Chore.find(filter).populate('assignedTo', 'username').populate('createdBy', 'username');
  res.json({ chores });
});

// GET /api/chores/:id - Get single chore
router.get('/:id', requireAuth, attachUser, async (req, res) => {
  const chore = await Chore.findById(req.params.id).populate('assignedTo', 'username').populate('createdBy', 'username');
  if (!chore) return res.status(404).json({ message: 'Chore not found' });
  // Only allow if user is assigned, created, or parent
  if (
    req.user.role === 'child' &&
    !chore.assignedTo?.equals(req.user._id) &&
    !chore.createdBy.equals(req.user._id)
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json({ chore });
});

// POST /api/chores - Create a new chore
router.post('/', requireAuth, attachUser, async (req, res) => {
  try {
    const { title, description, steps, totalValue, assignedTo, recurrence, dueDate } = req.body;
    if (!title || !totalValue) {
      return res.status(400).json({ message: 'Title and totalValue are required.' });
    }
    // Only parents can assign chores to others
    let assigned = null;
    if (assignedTo) {
      if (req.user.role !== 'parent') {
        return res.status(403).json({ message: 'Only parents can assign chores.' });
      }
      assigned = assignedTo;
    }
    const chore = await Chore.create({
      title,
      description,
      steps,
      totalValue,
      assignedTo: assigned,
      createdBy: req.user._id,
      recurrence,
      dueDate,
    });
    res.status(201).json({ message: 'Chore created', chore });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chore', error: err.message });
  }
});

// PUT /api/chores/:id - Update a chore
router.put('/:id', requireAuth, attachUser, async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) return res.status(404).json({ message: 'Chore not found' });
    // Only creator or parent can update
    if (
      req.user.role !== 'parent' &&
      !chore.createdBy.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(chore, req.body);
    await chore.save();
    res.json({ message: 'Chore updated', chore });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update chore', error: err.message });
  }
});

// DELETE /api/chores/:id - Delete a chore
router.delete('/:id', requireAuth, attachUser, async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) return res.status(404).json({ message: 'Chore not found' });
    // Only creator or parent can delete
    if (
      req.user.role !== 'parent' &&
      !chore.createdBy.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await chore.deleteOne();
    res.json({ message: 'Chore deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chore', error: err.message });
  }
});

// PATCH /api/chores/:id/step/:stepIdx/complete - Mark a step as complete
router.patch('/:id/step/:stepIdx/complete', requireAuth, attachUser, async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) return res.status(404).json({ message: 'Chore not found' });
    const step = chore.steps[req.params.stepIdx];
    if (!step) return res.status(404).json({ message: 'Step not found' });
    // Only assigned user can complete
    if (
      req.user.role === 'child' &&
      !chore.assignedTo?.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    step.completedBy = req.user._id;
    step.completedAt = new Date();
    await chore.save();
    res.json({ message: 'Step marked complete', chore });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete step', error: err.message });
  }
});

// PATCH /api/chores/:id/step/:stepIdx/approve - Approve a step (parent only)
router.patch('/:id/step/:stepIdx/approve', requireAuth, attachUser, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can approve steps.' });
    }
    const chore = await Chore.findById(req.params.id);
    if (!chore) return res.status(404).json({ message: 'Chore not found' });
    const step = chore.steps[req.params.stepIdx];
    if (!step) return res.status(404).json({ message: 'Step not found' });
    step.approved = true;
    await chore.save();
    res.json({ message: 'Step approved', chore });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve step', error: err.message });
  }
});

module.exports = router;
