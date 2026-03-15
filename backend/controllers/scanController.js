const path = require('path');
const fs   = require('fs');
const FormData = require('form-data');
const axios    = require('axios');
const Scan     = require('../models/Scan');
const Report   = require('../models/Report');

const ML_BASE = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_BASE,
  timeout: 120_000,
});

async function callML(filePath, originalName, endpoint) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), originalName);
  const { data } = await mlClient.post(endpoint, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return data;
}

/* # endpoint map — all keys normalised to lowercase for safe lookup */
const ENDPOINT_MAP = {
  glaucoma:             '/predict/glaucoma',
  cataract:             '/predict/cataract',
  dr:                   '/predict/dr',
  'diabetic retinopathy': '/predict/dr',
  'diabeticretinopathy':  '/predict/dr',
};

/* # POST /api/scans/upload */
exports.uploadScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const patientId     = req.body.patientId || req.params.patientId;
    const diseaseTypes  = req.body.diseaseTypes;
    const threshold     = parseFloat(req.body.threshold) || 0.5;
    const clinicianName = req.body.clinicianName;

    if (!patientId || patientId === 'undefined') {
      return res.status(400).json({
        message: 'patientId is required. Make sure the upload form includes a valid patient ID.',
      });
    }

    const parsedTypes = (() => {
      try { return JSON.parse(diseaseTypes || '["All"]'); }
      catch { return ['All']; }
    })();

    const scan = await Scan.create({
      patientId,
      imagePath:    req.file.path,
      imageUrl:     `/uploads/scans/${req.file.filename}`,
      uploadedBy:   req.user._id,
      diseaseTypes: parsedTypes,
      threshold,
      clinicianName,
      status:       'processing',
    });

    const { path: filePath, originalname } = req.file;
    let mlResults = [];

    if (parsedTypes.includes('All')) {
      const data = await callML(filePath, originalname, '/predict/all');
      mlResults  = Object.values(data);
    } else {
      const tasks = parsedTypes
        .map(d => ENDPOINT_MAP[d.toLowerCase().trim()])
        .filter(Boolean)
        .map(endpoint => callML(filePath, originalname, endpoint));
      mlResults = await Promise.all(tasks);
    }

    const report = await Report.create({
      patientId,
      scanId:       scan._id,
      results:      mlResults,
      createdBy:    req.user._id,
      threshold,
      clinicianName,
    });

    scan.status = 'completed';
    await scan.save();

    res.status(201).json({ scan, report });

  } catch (err) {
    console.error('Scan upload error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'ML service is not running. Start the Python server on port 8000.' });
    }
    if (err.code === 'ECONNRESET' || err.message?.includes('socket hang up')) {
      return res.status(504).json({ message: 'ML inference timed out. Try selecting fewer models or check the ML server.' });
    }
    res.status(500).json({ message: err.message });
  }
};

/* # GET /api/scans/patient/:patientId */
exports.getPatientScans = async (req, res) => {
  try {
    const scans = await Scan.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};