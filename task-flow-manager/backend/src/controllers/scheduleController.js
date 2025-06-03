// backend/src/controllers/scheduleController.js
const scheduleService = require('../services/scheduleService');
const Joi = require('joi');

const scheduleController = {
  // Generate schedule for user
  async generateSchedule(req, res) {
    try {
      const userId = req.userId || 1; // TODO: Get from auth middleware
      
      // Validate query parameters
      const schema = Joi.object({
        days: Joi.number().integer().min(1).max(14).default(7),
        workSchedule: Joi.object().optional()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { days, workSchedule } = value;
      
      const schedule = await scheduleService.generateSchedule(userId, workSchedule, days);
      
      res.json(schedule);
    } catch (error) {
      console.error('Generate schedule error:', error);
      res.status(500).json({ error: 'Failed to generate schedule' });
    }
  },

  // Get scheduling statistics
  async getStats(req, res) {
    try {
      const userId = req.userId || 1; // TODO: Get from auth middleware
      
      const stats = await scheduleService.getSchedulingStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get scheduling stats' });
    }
  },

  // Update schedule after task completion
  async updateAfterCompletion(req, res) {
    try {
      const { taskId } = req.params;
      
      const result = await scheduleService.updateScheduleAfterCompletion(taskId);
      
      res.json(result);
    } catch (error) {
      console.error('Update after completion error:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  }
};

module.exports = scheduleController;
