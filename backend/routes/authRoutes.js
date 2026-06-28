const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');

// Public routes
router.post('/register', authController.register);
router.post('/request-account', authController.requestAccountCreation);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router;
