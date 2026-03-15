const Patient = require('../models/Patient');
const User    = require('../models/User');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.getPatients = asyncHandler(async (req, res) => {
  let patients;
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    patients = await Patient.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  } else {
    patients = await Patient.find({ user: req.user._id });
  }
  res.json({ success: true, data: patients });
});

exports.getMyPatientRecord = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'No patient record found. Please complete your profile.' });
  }
  res.json({ success: true, data: patient });
});

exports.createPatient = asyncHandler(async (req, res) => {
  const { fullName, age, gender, phone, medicalHistory } = req.body;

  const isDoctor = req.user.role === 'doctor' || req.user.role === 'admin';

  const email = isDoctor ? req.body.email : req.user.email;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Patient email is required.' });
  }
  if (!fullName) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }

  let patientUser;

  if (isDoctor) {
    patientUser = await User.findOne({ email });

    if (patientUser && patientUser.role !== 'patient') {
      return res.status(400).json({ success: false, message: 'This email belongs to a non-patient account.' });
    }

    if (!patientUser) {
      const bcrypt      = require('bcryptjs');
      const rawPassword = phone || 'EyeAI@123';
      const hashed      = await bcrypt.hash(rawPassword, 10);
      patientUser = await User.create({ name: fullName, email, password: hashed, role: 'patient' });
    }
  } else {
    patientUser = req.user;
  }

  const existing = await Patient.findOne({ user: patientUser._id });
  if (existing) {
    return res.status(200).json({
      success: true,
      data:    existing,
      message: 'Patient profile already exists.',
    });
  }

  const patient = await Patient.create({
    fullName,
    age,
    gender,
    phone,
    medicalHistory,
    user:      patientUser._id,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data:    patient,
    message: 'Patient profile created successfully.',
  });
});

/* # GET /api/patients/:id */
exports.getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const isDoctor = req.user.role === 'doctor' || req.user.role === 'admin';
  const isSelf   = String(patient.user) === String(req.user._id);

  if (!isDoctor && !isSelf) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, data: patient });
});

/* # PUT /api/patients/:id */
exports.updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, data: patient });
});