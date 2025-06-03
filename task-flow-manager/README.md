# Task Flow Manager

An ADHD-friendly task management system that automatically schedules your work into manageable 2-hour blocks, respects task dependencies, and integrates with Google Calendar.

## Features

✅ **Smart Project Management**
- Create projects with priority levels (immediate → do whenever)
- Sequential vs. flexible task ordering
- Categories: professional, personal, home, social

✅ **Intelligent Scheduling**
- Automatic 2-hour time block generation
- Priority-based task ordering
- Respects sequential dependencies
- Mobile-responsive design

✅ **ADHD-Friendly Design**
- Flexible calendar commitment (1-7 days)
- Visual progress indicators
- Immediate feedback with DONE! buttons
- Reduces decision fatigue

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Installation

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd task-flow-manager
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run db:migrate
   ```

3. **Frontend setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Database Setup

See [Database Setup Guide](docs/database-setup.md) for detailed PostgreSQL installation instructions.

## API Documentation

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `POST /api/tasks/project/:projectId` - Create task
- `PATCH /api/tasks/:id/complete` - Complete task
- `DELETE /api/tasks/:id` - Delete task

### Schedule
- `GET /api/schedule/generate?days=7` - Generate schedule
- `GET /api/schedule/stats` - Get statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
