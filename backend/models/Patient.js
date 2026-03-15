const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String },
  medicalHistory: {
    diabetes: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false },
    familyGlaucoma: { type: Boolean, default: false },
    familyCataract: { type: Boolean, default: false },
  },
  currentMedications: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);