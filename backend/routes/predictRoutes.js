const express = require('express');
const router = express.Router();
const controller = require('../controllers/predictController');

router.post('/', controller.predict);

module.exports = router;
