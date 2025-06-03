// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/project/:projectId', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/complete', taskController.completeTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
