const express = require('express');
const { simulatePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/simulate', protect, simulatePayment);

module.exports = router;
