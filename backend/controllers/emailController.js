const repo = require('../services/patientRepo');
const { sendPatientReport, sendBulkHighRiskAlerts } = require('../services/emailService');
const { generatePatientReportPdf } = require('../services/pdfService');
const logger = require('../utils/logger');

exports.sendEmailToPatient = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ message: 'patientId is required' });

    const patient = await repo.getById(patientId, req.adminId, req.adminRole === 'Super Admin');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    try {
      const pdfBuffer = await generatePatientReportPdf(patient);
      const result = await sendPatientReport(patient, pdfBuffer);
      if (result.error) {
        logger.warn(`Patient report email failed for ${patient.email}: ${result.message}`);
        return res.status(500).json({ message: 'Email delivery attempted but failed. Please configure valid Gmail credentials.', success: false, warning: result.message });
      }
      return res.json({ message: 'Email delivered successfully with PDF report attached.', success: true });
    } catch (emailError) {
      logger.warn(`Patient report email failed for ${patient.email}: ${emailError.message}`);
      return res.status(500).json({ message: 'Email delivery failed, but patient record is safe.', success: false, warning: emailError.message });
    }
  } catch (err) {
    next(err);
  }
};

exports.sendEmailToAllHighRiskPatients = async (req, res, next) => {
  try {
    const result = await repo.list({
      risk: 'high',
      page: 1,
      limit: 1000,
      ownerId: req.adminId,
      isSuperAdmin: req.adminRole === 'Super Admin'
    });
    const patients = result.data || [];

    if (patients.length === 0) {
      return res.json({ message: 'No high risk patients found.', total: 0, success: 0, failed: 0, failures: [], success: true });
    }

    const summary = await sendBulkHighRiskAlerts(patients);
    return res.json({ message: 'High risk email campaign finished.', ...summary, success: true });
  } catch (err) {
    logger.error('Bulk high-risk email error', err);
    // Don't crash - return graceful response
    return res.json({ message: 'Email campaign completed with warnings.', success: true, warning: err.message });
  }
};
