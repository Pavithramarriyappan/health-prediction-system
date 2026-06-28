const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, lowercase: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: null },
  mobile: { 
    type: String, 
    required: true, 
    match: /^\d{10}$/,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  glucose: { type: Number, required: true },
  haemoglobin: { type: Number, required: true },
  cholesterol: { type: Number, required: true },
  remarks: {
    possibleCondition: { type: String },
    reason: { type: String },
    recommendation: { type: String }
  },
  whatsappSent: { type: Boolean, default: false },
  whatsappError: { type: String, default: null },
  // Metadata returned by WhatsApp API (SID, mode, raw response)
  whatsappMeta: {
    sid: { type: String, default: null },
    mode: { type: String, default: null },
    response: { type: mongoose.Schema.Types.Mixed, default: null },
    sentAt: { type: Date, default: null }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  createdAt: { type: Date, default: Date.now }
});

patientSchema.virtual('age').get(function () {
  if (!this.dob) return null;
  const diff = Date.now() - this.dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
