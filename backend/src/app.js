// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/calendar', require('./routes/calendar'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ============================================================================
// backend/src/database/connection.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/taskflow', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err));

module.exports = sequelize;

// ============================================================================
// backend/src/models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  priority: {
    type: DataTypes.ENUM('immediate', 'urgent', 'usual', 'if you have time', 'do whenever'),
    allowNull: false,
    defaultValue: 'usual'
  },
  category: {
    type: DataTypes.ENUM('professional', 'personal', 'home', 'social'),
    allowNull: false,
    defaultValue: 'professional'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    field: 'due_date'
  },
  hasSequentialTasks: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_sequential_tasks'
  }
}, {
  tableName: 'projects',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Project;

// ============================================================================
// backend/src/models/Task.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'project_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    field: 'estimated_hours',
    validate: {
      min: 0.1,
      max: 99.99
    }
  },
  actualHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
    field: 'actual_hours'
  },
  taskOrder: {
    type: DataTypes.INTEGER,
    field: 'task_order'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  }
}, {
  tableName: 'tasks',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Task;

// ============================================================================
// backend/src/models/index.js
const Project = require('./Project');
const Task = require('./Task');

// Define associations
Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
  onDelete: 'CASCADE'
});

Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

module.exports = {
  Project,
  Task
};

// ============================================================================
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

// ============================================================================
// backend/src/controllers/taskController.js
const { Task, Project } = require('../models');
const Joi = require('joi');

const taskSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  estimatedHours: Joi.number().min(0.1).max(99.99).required(),
  taskOrder: Joi.number().integer().min(1).optional()
});

const taskController = {
  // Create a new task
  async createTask(req, res) {
    try {
      const { projectId } = req.params;
      const { error, value } = taskSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Verify project exists and belongs to user
      const userId = req.userId || 1; // TODO: Get from auth middleware
      const project = await Project.findOne({
        where: { id: projectId, userId }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const task = await Task.create({
        ...value,
        projectId: parseInt(projectId)
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  // Update a task
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = taskSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const [updatedRows] = await Task.update(value, {
        where: { id }
      });

      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedTask = await Task.findByPk(id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  // Complete a task
  async completeTask(req, res) {
    try {
      const { id } = req.params;
      
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Calculate actual hours based on estimated hours (for now)
      // In real implementation, this would track actual time blocks
      const actualHours = task.estimatedHours;

      await task.update({
        completed: true,
        completedAt: new Date(),
        actualHours
      });

      res.json(task);
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  },

  // Delete a task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      const deletedRows = await Task.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
};

module.exports = taskController;

// ============================================================================
// backend/src/routes/projects.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;

// ============================================================================
// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/project/:projectId', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/complete', taskController.completeTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;

// ============================================================================
// backend/src/routes/schedule.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/generate', scheduleController.generateSchedule);
router.get('/stats', scheduleController.getStats);
router.post('/update-after-completion/:taskId', scheduleController.updateAfterCompletion);

module.exports = router;

// ============================================================================
// backend/src/routes/calendar.js
const express = require('express');
const router = express.Router();

// Placeholder for calendar routes
router.post('/commit', (req, res) => {
  res.json({ message: 'Calendar commit endpoint - coming soon!' });
});

module.exports = router;