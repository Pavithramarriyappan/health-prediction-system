const express = require('express');
const router = express.Router();
const pendingRequestController = require('../controllers/pendingRequestController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

// Public routes (no authentication required) - for email links
router.get('/:id/approve', pendingRequestController.approveFromEmail);
router.get('/:id/reject', pendingRequestController.rejectFromEmail);

// Protected routes (requires authentication)
router.use(authenticateToken);
router.use(authorizeRole('Super Admin'));

router.get('/', pendingRequestController.getPendingRequests);
router.get('/counts', pendingRequestController.getPendingCounts);
router.post('/:id/approve-account', pendingRequestController.approveAccountRequest);
router.post('/:id/approve-password-reset', pendingRequestController.approvePasswordResetRequest);
router.post('/:id/reject', pendingRequestController.rejectRequest);

module.exports = router;
