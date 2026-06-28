const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticateToken);
router.use(authorizeRole('Super Admin'));

router.get('/', adminController.getAdmins);
router.get('/:id', adminController.getAdminById);
router.post('/', adminController.createAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);
router.put('/:id/reset-password', adminController.resetAdminPassword);

module.exports = router;
