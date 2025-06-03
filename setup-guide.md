# Task Flow Manager - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Git (optional)

### 1. Create Project Structure
```bash
mkdir task-flow-manager
cd task-flow-manager
```

### 2. Backend Setup
```bash
mkdir backend
cd backend

# Initialize npm and install dependencies
npm init -y
npm install express cors helmet morgan dotenv sequelize pg pg-hstore
npm install bcryptjs jsonwebtoken joi googleapis
npm install --save-dev nodemon concurrently

# Create package.json scripts
```

**backend/package.json** (update scripts section):
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "db:migrate": "node src/database/migrate.js"
  }
}
```

### 3. Frontend Setup
```bash
cd ../
npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install
npm install @tanstack/react-query axios react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**frontend/tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**frontend/src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb taskflow

# Or using psql:
psql -c "CREATE DATABASE taskflow;"
```

### 5. Environment Configuration

**backend/.env**:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/taskflow
JWT_SECRET=your-super-secret-jwt-key-make-this-long-and-random
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 6. Create Backend Files

Create the following directory structure in `backend/src/`:
```
backend/src/
├── controllers/
├── models/
├── routes/
├── services/
├── database/
└── app.js
```

Copy all the backend code from the artifacts above into the appropriate files.

### 7. Create Frontend Files

Replace the generated frontend files with the components from the artifacts above.

### 8. Database Migration
```bash
cd backend
npm run db:migrate
```

### 9. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Complete File Structure

```
task-flow-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── scheduleController.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── Project.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   ├── schedule.js
│   │   │   └── calendar.js
│   │   ├── services/
│   │   │   └── scheduleService.js
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   └── migrate.js
│   │   └── app.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Projects/
│   │   │   │   ├── ProjectsTab.jsx
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   └── ProjectForm.jsx
│   │   │   ├── Schedule/
│   │   │   │   └── ScheduleTab.jsx
│   │   │   ├── Settings/
│   │   │   │   └── SettingsTab.jsx
│   │   │   └── Common/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ErrorMessage.jsx
│   │   ├── hooks/
│   │   │   ├── useProjects.js
│   │   │   └── useSchedule.js
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
└── README.md
```

## 🎯 Current Features

✅ **Project Management**
- Create/update/delete projects
- Priority levels (immediate → do whenever)
- Categories (professional, personal, home, social)
- Sequential vs. flexible task ordering

✅ **Task Management**
- Add tasks to projects with time estimates
- Complete tasks with DONE! buttons
- Track estimated vs. actual hours
- Dependency handling for sequential projects

✅ **Smart Scheduling**
- Generate 2-hour time blocks automatically
- Priority-based task ordering
- Respect sequential dependencies
- Multi-block tasks for longer work

✅ **ADHD-Friendly Features**
- Flexible calendar commitment (1-7 days)
- Visual progress indicators
- Clear task availability status
- Mobile-responsive design

## 🔄 Next Steps

### Phase 2: Google Calendar Integration
1. Set up Google OAuth 2.0
2. Implement calendar sync functionality
3. Handle calendar conflicts
4. Two-way sync capabilities

### Phase 3: Enhanced Features
1. Task time tracking
2. Break reminders
3. Analytics and reporting
4. Drag-and-drop task reordering
5. Bulk task operations

### Phase 4: Advanced ADHD Features
1. Energy level matching
2. Context switching alerts
3. Momentum tracking
4. Distraction handling

## 🐛 Troubleshooting

**Database Connection Issues:**
```bash
# Check PostgreSQL status
pg_ctl status

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart   # Linux
```

**Port Conflicts:**
- Backend runs on http://localhost:3001
- Frontend runs on http://localhost:5173
- Change ports in .env files if needed

**Missing Dependencies:**
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

## 🚀 Deployment Ready

The application is structured for easy deployment to:
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Heroku Postgres, PlanetScale, Supabase

## 📖 API Documentation

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `POST /api/tasks/project/:projectId` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Complete task
- `DELETE /api/tasks/:id` - Delete task

### Schedule
- `GET /api/schedule/generate?days=7` - Generate schedule
- `GET /api/schedule/stats` - Get scheduling statistics

You now have a fully functional ADHD-friendly task management system! 🎉