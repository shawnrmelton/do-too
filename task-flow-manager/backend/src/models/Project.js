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
