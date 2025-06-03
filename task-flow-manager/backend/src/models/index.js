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
