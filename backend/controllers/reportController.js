const Report  = require('../models/Report');
const Scan    = require('../models/Scan');
const pdfService = require('../services/pdfService');

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId')
      .populate('scanId')
      .populate('createdBy', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientReports = async (req, res) => {
  try {
    const param = req.params.patientId;
    let query;

    if (param.includes('@')) {
      const User    = require('../models/User');
      const Patient = require('../models/Patient');
      const user    = await User.findOne({ email: param });
      if (!user) return res.json([]);
      const patient = await Patient.findOne({ user: user._id });
      if (!patient) return res.json([]);
      query = { patientId: patient._id };
    } else {
      query = { patientId: param };
    }

    const reports = await Report.find(query)
      .populate('scanId')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateNotes = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { doctorNotes: req.body.doctorNotes },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId')
      .populate('scanId');
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const pdfBuffer = await pdfService.generateReport(report);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="EyeAI-Report-${report._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('patientId', 'fullName age gender')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};