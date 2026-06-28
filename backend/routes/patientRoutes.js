const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController');
const validate = require('../middleware/validatePatient');

router.get('/', controller.getPatients);
router.get('/:id/report', controller.downloadPatientReport);
router.get('/:id', controller.getPatientById);
router.post('/', validate, controller.createPatient);
router.put('/:id', validate, controller.updatePatient);
router.delete('/:id', controller.deletePatient);

module.exports = router;
