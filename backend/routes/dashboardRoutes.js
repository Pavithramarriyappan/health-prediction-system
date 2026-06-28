const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticateToken);
router.use(authorizeRole('Super Admin'));

router.get('/', dashboardController.getDashboardMetrics);

module.exports = router;
