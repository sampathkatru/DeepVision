const router = require('express').Router();
const { uploadScan, getPatientScans } = require('../controllers/scanController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.post('/upload', upload.single('image'), uploadScan);
router.get('/patient/:patientId', getPatientScans);

module.exports = router;
