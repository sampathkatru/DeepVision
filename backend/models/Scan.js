const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  patientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  imagePath:    { type: String, required: true },
  imageUrl:     { type: String },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diseaseTypes: [{ type: String, enum: ['Glaucoma', 'Cataract', 'Diabetic Retinopathy', 'All'] }],
  threshold:    { type: Number, default: 0.5 },
  status:       { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  clinicianName:{ type: String },
  examDate:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
