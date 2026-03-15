const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  disease:       { type: String },
  prediction:    { type: String },
  confidence:    { type: Number },
  probabilities: { type: mongoose.Schema.Types.Mixed },
  gradcam:       { type: String },
  heatmapUrl:    { type: String },
}, { _id: false });

const reportSchema = new mongoose.Schema({
  patientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  scanId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Scan',    required: true },
  results:     [resultSchema],
  doctorNotes: { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);