const mongoose = require('mongoose');

const pendingRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['AccountCreation', 'PasswordReset'],
    required: true
  },
  fullName: {
    type: String,
    required: function() {
      return this.requestType === 'AccountCreation';
    }
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must contain exactly 10 digits']
  },
  role: {
    type: String,
    enum: ['Clinic Owner', 'Doctor', 'Super Admin'],
    default: 'Clinic Owner'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Expired', 'Completed'],
    default: 'Pending'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 60 * 60 * 1000);
    }
  },
  password: {
    type: String,
    required: function() {
      return this.requestType === 'AccountCreation';
    }
  },
  otp: {
    type: String,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pendingRequestSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;

  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  }

  next();
});

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);
