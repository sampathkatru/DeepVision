const router = require('express').Router();
const { getReport, getPatientReports, updateNotes, downloadPDF, getAllReports } = require('../controllers/reportController');
const { protect, requireDoctor } = require('../middleware/auth');

router.use(protect);
router.get('/', requireDoctor, getAllReports);
router.get('/:id', getReport);
router.get('/:id/pdf', downloadPDF);
router.get('/patient/:patientId', getPatientReports);
router.put('/:id/notes', requireDoctor, updateNotes);

module.exports = router;
