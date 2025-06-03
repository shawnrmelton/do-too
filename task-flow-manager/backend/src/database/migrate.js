// backend/src/database/migrate.js
const sequelize = require('./connection');
const { Project, Task } = require('../models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database migration completed successfully');
    
    // Create sample data for testing
    await createSampleData();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  try {
    console.log('📝 Creating sample data...');
    
    // Check if data already exists
    const existingProjects = await Project.count();
    if (existingProjects > 0) {
      console.log('📋 Sample data already exists, skipping...');
      return;
    }

    // Create sample projects
    const project1 = await Project.create({
      userId: 1,
      name: "Website Redesign",
      priority: "urgent",
      category: "professional",
      dueDate: "2025-06-15",
      hasSequentialTasks: true
    });

    const project2 = await Project.create({
      userId: 1,
      name: "Kitchen Cabinet Repair",
      priority: "usual",
      category: "home",
      dueDate: "2025-06-30",
      hasSequentialTasks: true
    });

    const project3 = await Project.create({
      userId: 1,
      name: "Plan Friend Hangout",
      priority: "if you have time",
      category: "social",
      dueDate: "2025-06-20",
      hasSequentialTasks: false
    });

    // Create sample tasks
    await Task.bulkCreate([
      // Website Redesign tasks (sequential)
      {
        projectId: project1.id,
        name: "Research competitor sites",
        estimatedHours: 2,
        taskOrder: 1,
        completed: true,
        completedAt: new Date('2025-06-01'),
        actualHours: 1.5
      },
      {
        projectId: project1.id,
        name: "Create wireframes",
        estimatedHours: 4,
        taskOrder: 2
      },
      {
        projectId: project1.id,
        name: "Design mockups",
        estimatedHours: 6,
        taskOrder: 3
      },

      // Kitchen Cabinet tasks (sequential)
      {
        projectId: project2.id,
        name: "Buy wood stain",
        estimatedHours: 1,
        taskOrder: 1
      },
      {
        projectId: project2.id,
        name: "Sand cabinet doors",
        estimatedHours: 3,
        taskOrder: 2
      },
      {
        projectId: project2.id,
        name: "Apply stain",
        estimatedHours: 2,
        taskOrder: 3
      },

      // Friend Hangout tasks (non-sequential)
      {
        projectId: project3.id,
        name: "Text group chat",
        estimatedHours: 0.5
      },
      {
        projectId: project3.id,
        name: "Research activities",
        estimatedHours: 1
      },
      {
        projectId: project3.id,
        name: "Make reservations",
        estimatedHours: 0.5
      }
    ]);

    console.log('✅ Sample data created successfully');
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate, createSampleData };
