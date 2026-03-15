const router = require('express').Router();
const {
  getPatients,
  getMyPatientRecord,
  createPatient,
  getPatient,
  updatePatient,
} = require('../controllers/patientController');
const { protect, requireDoctor } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMyPatientRecord);
router.get('/',    requireDoctor, getPatients);
router.post('/',   createPatient);
router.get('/:id', getPatient);
router.put('/:id', requireDoctor, updatePatient);

module.exports = router;