const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weatherAlerts: { type: Boolean, default: false },
  cropAlerts: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', settingSchema);
