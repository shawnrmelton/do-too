// backend/src/controllers/projectController.js
const { Project, Task } = require('../models');
const Joi = require('joi');

const projectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  priority: Joi.string().valid('immediate', 'urgent', 'usual', 'if you have time', 'do whenever').required(),
  category: Joi.string().valid('professional', 'personal', 'home', 'social').required(),
  dueDate: Joi.date().iso().optional(),
  hasSequentialTasks: Joi.boolean().optional()
});

const projectController = {
  // Get all projects for a user
  async getProjects(req, res) {
    try {
      const userId = req.userId || 1; // TODO: Get from auth middleware
      
      const projects = await Project.findAll({
        where: { userId },
        include: [{
          model: Task,
          as: 'tasks',
          order: [['taskOrder', 'ASC'], ['createdAt', 'ASC']]
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  },

  // Create a new project
  async createProject(req, res) {
    try {
      const { error, value } = projectSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.userId || 1; // TODO: Get from auth middleware
      
      const project = await Project.create({
        ...value,
        userId
      });

      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  },

  // Update a project
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = projectSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.userId || 1; // TODO: Get from auth middleware
      
      const [updatedRows] = await Project.update(value, {
        where: { id, userId }
      });

      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const updatedProject = await Project.findByPk(id, {
        include: [{
          model: Task,
          as: 'tasks',
          order: [['taskOrder', 'ASC'], ['createdAt', 'ASC']]
        }]
      });

      res.json(updatedProject);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  },

  // Delete a project
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId || 1; // TODO: Get from auth middleware
      
      const deletedRows = await Project.destroy({
        where: { id, userId }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
};

module.exports = projectController;
