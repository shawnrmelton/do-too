// backend/src/utils/validation.js
const Joi = require('joi');

const schemas = {
  project: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    priority: Joi.string().valid('immediate', 'urgent', 'usual', 'if you have time', 'do whenever').required(),
    category: Joi.string().valid('professional', 'personal', 'home', 'social').required(),
    dueDate: Joi.date().iso().optional().allow(null),
    hasSequentialTasks: Joi.boolean().optional()
  }),

  task: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    estimatedHours: Joi.number().min(0.1).max(99.99).required(),
    taskOrder: Joi.number().integer().min(1).optional().allow(null)
  }),

  scheduleQuery: Joi.object({
    days: Joi.number().integer().min(1).max(14).default(7),
    workSchedule: Joi.object().optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    req.validatedData = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: error.details.map(d => d.message)
      });
    }
    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateQuery
};
