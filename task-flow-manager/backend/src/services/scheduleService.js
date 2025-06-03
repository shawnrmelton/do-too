// backend/src/services/scheduleService.js
const { Project, Task } = require('../models');
const { Op } = require('sequelize');

class ScheduleService {
  constructor() {
    this.priorityOrder = ['immediate', 'urgent', 'usual', 'if you have time', 'do whenever'];
  }

  /**
   * Get all available tasks (respects dependencies)
   */
  getAvailableTasks(project) {
    const incompleteTasks = project.tasks.filter(task => !task.completed);
    
    if (!project.hasSequentialTasks) {
      return incompleteTasks;
    }
    
    // For sequential projects, only return the next task in sequence
    if (incompleteTasks.length === 0) return [];
    
    const sortedTasks = incompleteTasks.sort((a, b) => {
      const orderA = a.taskOrder || 999;
      const orderB = b.taskOrder || 999;
      return orderA - orderB;
    });
    
    return [sortedTasks[0]];
  }

  /**
   * Generate time blocks for a task
   */
  generateTaskBlocks(task, project) {
    const blocksNeeded = Math.ceil(task.estimatedHours / 2);
    const blocks = [];
    
    for (let i = 0; i < blocksNeeded; i++) {
      blocks.push({
        taskId: task.id,
        taskName: task.name,
        projectId: project.id,
        projectName: project.name,
        priority: project.priority,
        category: project.category,
        isSequential: project.hasSequentialTasks,
        taskOrder: task.taskOrder,
        blockNumber: i + 1,
        totalBlocks: blocksNeeded,
        estimatedHours: task.estimatedHours
      });
    }
    
    return blocks;
  }

  /**
   * Generate work schedule based on work hours and available tasks
   */
  async generateSchedule(userId, workSchedule = {}, days = 7) {
    try {
      // Default work schedule if none provided
      const defaultSchedule = {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '17:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: false },
        sunday: { start: '10:00', end: '14:00', enabled: false }
      };
      
      const schedule = { ...defaultSchedule, ...workSchedule };

      // Get all projects with tasks for the user
      const projects = await Project.findAll({
        where: { userId },
        include: [{
          model: Task,
          as: 'tasks',
          where: { completed: false },
          required: false,
          order: [['taskOrder', 'ASC'], ['createdAt', 'ASC']]
        }],
        order: [['dueDate', 'ASC']]
      });

      // Generate all available task blocks
      const allTaskBlocks = [];
      projects.forEach(project => {
        const availableTasks = this.getAvailableTasks(project);
        availableTasks.forEach(task => {
          const blocks = this.generateTaskBlocks(task, project);
          allTaskBlocks.push(...blocks);
        });
      });

      // Sort blocks by priority and due dates
      allTaskBlocks.sort((a, b) => {
        // First by priority
        const aPriorityIndex = this.priorityOrder.indexOf(a.priority);
        const bPriorityIndex = this.priorityOrder.indexOf(b.priority);
        
        if (aPriorityIndex !== bPriorityIndex) {
          return aPriorityIndex - bPriorityIndex;
        }
        
        // Then by project due date (if available)
        const aProject = projects.find(p => p.id === a.projectId);
        const bProject = projects.find(p => p.id === b.projectId);
        
        if (aProject?.dueDate && bProject?.dueDate) {
          return new Date(aProject.dueDate) - new Date(bProject.dueDate);
        }
        
        return 0;
      });

      // Generate daily schedule
      const generatedSchedule = [];
      const today = new Date();
      let blockIndex = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        if (schedule[dayName]?.enabled) {
          const daySchedule = this.generateDaySchedule(
            date,
            schedule[dayName],
            allTaskBlocks,
            blockIndex
          );
          
          generatedSchedule.push(daySchedule.schedule);
          blockIndex = daySchedule.nextBlockIndex;
        }
      }

      return {
        schedule: generatedSchedule,
        totalTaskBlocks: allTaskBlocks.length,
        scheduledBlocks: blockIndex,
        availableProjects: projects.length
      };

    } catch (error) {
      console.error('Schedule generation error:', error);
      throw new Error('Failed to generate schedule');
    }
  }

  /**
   * Generate schedule for a single day
   */
  generateDaySchedule(date, daySettings, allTaskBlocks, startBlockIndex) {
    const startHour = parseInt(daySettings.start.split(':')[0]);
    const endHour = parseInt(daySettings.end.split(':')[0]);
    const workHours = endHour - startHour;
    const availableSlots = Math.floor(workHours / 2);

    const daySchedule = {
      date: date.toLocaleDateString(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      slots: []
    };

    let blockIndex = startBlockIndex;

    for (let slot = 0; slot < availableSlots; slot++) {
      const slotStart = startHour + (slot * 2);
      const slotEnd = slotStart + 2;
      
      let slotData = {
        time: `${slotStart.toString().padStart(2, '0')}:00 - ${slotEnd.toString().padStart(2, '0')}:00`,
        task: 'Open slot',
        taskId: null,
        project: null,
        priority: null,
        blockInfo: null,
        isSequential: false,
        taskOrder: null
      };

      // Assign task block if available
      if (blockIndex < allTaskBlocks.length) {
        const taskBlock = allTaskBlocks[blockIndex];
        slotData = {
          time: slotData.time,
          task: taskBlock.taskName,
          taskId: taskBlock.taskId,
          project: taskBlock.projectName,
          priority: taskBlock.priority,
          category: taskBlock.category,
          blockInfo: `Block ${taskBlock.blockNumber} of ${taskBlock.totalBlocks}`,
          isSequential: taskBlock.isSequential,
          taskOrder: taskBlock.taskOrder,
          estimatedHours: taskBlock.estimatedHours
        };
        blockIndex++;
      }

      daySchedule.slots.push(slotData);
    }

    return {
      schedule: daySchedule,
      nextBlockIndex: blockIndex
    };
  }

  /**
   * Get scheduling statistics
   */
  async getSchedulingStats(userId) {
    try {
      const projects = await Project.findAll({
        where: { userId },
        include: [{
          model: Task,
          as: 'tasks'
        }]
      });

      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.tasks.some(t => !t.completed)).length,
        totalTasks: projects.reduce((sum, p) => sum + p.tasks.length, 0),
        completedTasks: projects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0),
        totalEstimatedHours: projects.reduce((sum, p) => 
          sum + p.tasks.filter(t => !t.completed).reduce((taskSum, t) => taskSum + parseFloat(t.estimatedHours), 0), 0
        ),
        blockedTasks: 0 // Calculate blocked sequential tasks
      };

      // Calculate blocked tasks
      projects.forEach(project => {
        if (project.hasSequentialTasks) {
          const incompleteTasks = project.tasks.filter(t => !t.completed);
          if (incompleteTasks.length > 1) {
            // All tasks except the first available one are blocked
            stats.blockedTasks += incompleteTasks.length - 1;
          }
        }
      });

      stats.completionRate = stats.totalTasks > 0 ? 
        Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

      return stats;
    } catch (error) {
      console.error('Stats calculation error:', error);
      throw new Error('Failed to calculate scheduling stats');
    }
  }

  /**
   * Update schedule after task completion
   */
  async updateScheduleAfterCompletion(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [{
          model: Project,
          as: 'project',
          include: [{
            model: Task,
            as: 'tasks'
          }]
        }]
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // If this was a sequential project, check if next task should be unlocked
      if (task.project.hasSequentialTasks) {
        const incompleteTasks = task.project.tasks
          .filter(t => !t.completed)
          .sort((a, b) => (a.taskOrder || 999) - (b.taskOrder || 999));

        return {
          nextTaskUnlocked: incompleteTasks.length > 0 ? incompleteTasks[0] : null,
          projectCompleted: incompleteTasks.length === 0
        };
      }

      return {
        nextTaskUnlocked: null,
        projectCompleted: task.project.tasks.every(t => t.completed)
      };
    } catch (error) {
      console.error('Update schedule error:', error);
      throw new Error('Failed to update schedule after task completion');
    }
  }
}

module.exports = new ScheduleService();
