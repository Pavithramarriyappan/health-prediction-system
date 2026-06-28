const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    default: 'Health Prediction System'
  },
  websiteName: {
    type: String,
    default: 'Health Prediction System'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    default: ''
  },
  supportEmail: {
    type: String,
    default: ''
  },
  footerText: {
    type: String,
    default: ''
  },
  dashboardTitle: {
    type: String,
    default: 'Super Admin Dashboard'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Setting', settingSchema);
