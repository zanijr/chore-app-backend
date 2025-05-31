const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  description: { type: String, required: true },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  photoUrl: { type: String },
  approved: { type: Boolean, default: false },
  value: { type: Number, required: true }, // Value for this step
});

const choreSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  steps: [stepSchema],
  totalValue: { type: Number, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if open
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'in_progress', 'pending_approval', 'completed', 'rejected'], default: 'open' },
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  leaderboardPeriod: { type: String }, // e.g., "2025-05" for monthly leaderboard
});

module.exports = mongoose.model('Chore', choreSchema);
