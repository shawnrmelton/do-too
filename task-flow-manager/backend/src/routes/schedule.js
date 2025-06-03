// backend/src/routes/schedule.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/generate', scheduleController.generateSchedule);

module.exports = router;
