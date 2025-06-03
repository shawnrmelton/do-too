// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: projectData,
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async createTask(projectId, taskData) {
    return this.request(`/tasks/project/${projectId}`, {
      method: 'POST',
      body: taskData,
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  }

  async completeTask(id) {
    return this.request(`/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedule endpoints
  async generateSchedule(days = 7, workSchedule = null) {
    const params = new URLSearchParams({ days: days.toString() });
    if (workSchedule) {
      params.append('workSchedule', JSON.stringify(workSchedule));
    }
    return this.request(`/schedule/generate?${params}`);
  }

  async getScheduleStats() {
    return this.request('/schedule/stats');
  }

  async updateScheduleAfterCompletion(taskId) {
    return this.request(`/schedule/update-after-completion/${taskId}`, {
      method: 'POST',
    });
  }

  // Calendar endpoints
  async commitToCalendar(days, scheduleData) {
    return this.request('/calendar/commit', {
      method: 'POST',
      body: { days, scheduleData },
    });
  }
}

export default new ApiService();

// ============================================================================
// frontend/src/hooks/useProjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => api.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, ...data }) => api.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

// ============================================================================
// frontend/src/hooks/useSchedule.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useSchedule = (days = 7, workSchedule = null) => {
  return useQuery({
    queryKey: ['schedule', days, workSchedule],
    queryFn: () => api.generateSchedule(days, workSchedule),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useScheduleStats = () => {
  return useQuery({
    queryKey: ['schedule-stats'],
    queryFn: api.getScheduleStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCommitToCalendar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ days, scheduleData }) => api.commitToCalendar(days, scheduleData),
    onSuccess: () => {
      // Update any calendar-related queries if needed
    },
  });
};

// ============================================================================
// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

// ============================================================================
// frontend/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import ProjectsTab from '../components/Projects/ProjectsTab';
import ScheduleTab from '../components/Schedule/ScheduleTab';
import SettingsTab from '../components/Settings/SettingsTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  const tabs = [
    { id: 'tasks', label: 'Projects & Tasks', shortLabel: 'Tasks', icon: CheckCircle },
    { id: 'schedule', label: 'Generated Schedule', shortLabel: 'Schedule', icon: Calendar },
    { id: 'settings', label: 'Work Hours', shortLabel: 'Hours', icon: Clock }
  ];

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 bg-gray-50 min-h-screen">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Task Flow Manager
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          ADHD-friendly project organization and calendar integration
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md font-medium transition-colors flex-1 sm:flex-none ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'tasks' && <ProjectsTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};

export default Dashboard;

// ============================================================================
// frontend/src/components/Projects/ProjectsTab.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const ProjectsTab = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const { data: projects, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();

  const handleCreateProject = async (projectData) => {
    try {
      await createProjectMutation.mutateAsync(projectData);
      setShowNewProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Projects</h2>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      {showNewProject && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowNewProject(false)}
          isSubmitting={createProjectMutation.isPending}
        />
      )}

      <div className="grid gap-4 sm:gap-6">
        {projects?.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        {projects?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
            <button
              onClick={() => setShowNewProject(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTab;