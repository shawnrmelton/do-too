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
