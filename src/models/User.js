const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['parent', 'child'], required: true },
  points: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  completedChores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chore' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
