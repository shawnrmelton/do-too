// frontend/src/components/Projects/ProjectCard.jsx
import React from 'react';
import { CheckCircle, Circle, Plus, Edit3, Trash2 } from 'lucide-react';
import { useCompleteTask, useDeleteProject } from '../../hooks/useProjects';

const ProjectCard = ({ project }) => {
  const completeTaskMutation = useCompleteTask();
  const deleteProjectMutation = useDeleteProject();

  const priorityColors = {
    'immediate': 'bg-red-100 text-red-800 border-red-200',
    'urgent': 'bg-orange-100 text-orange-800 border-orange-200',
    'usual': 'bg-blue-100 text-blue-800 border-blue-200',
    'if you have time': 'bg-green-100 text-green-800 border-green-200',
    'do whenever': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const categoryColors = {
    'professional': 'bg-purple-50 border-l-purple-400',
    'personal': 'bg-blue-50 border-l-blue-400',
    'home': 'bg-green-50 border-l-green-400',
    'social': 'bg-pink-50 border-l-pink-400'
  };

  const getAvailableTasks = (project) => {
    const incompleteTasks = project.tasks.filter(task => !task.completed);
    
    if (!project.hasSequentialTasks) {
      return incompleteTasks;
    }
    
    if (incompleteTasks.length === 0) return [];
    
    const sortedTasks = incompleteTasks.sort((a, b) => {
      const orderA = a.taskOrder || 999;
      const orderB = b.taskOrder || 999;
      return orderA - orderB;
    });
    
    return [sortedTasks[0]];
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const availableTasks = getAvailableTasks(project);

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 sm:p-6 ${categoryColors[project.category]}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{project.name}</h3>
            {project.hasSequentialTasks && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Sequential
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${priorityColors[project.priority]}`}>
            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
          </span>
          <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm capitalize">
            {project.category}
          </span>
          <button
            onClick={handleDeleteProject}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {project.tasks.filter(task => !task.completed).map(task => {
          const canWork = !project.hasSequentialTasks || availableTasks.some(t => t.id === task.id);
          return (
            <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg ${canWork ? 'bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {project.hasSequentialTasks && task.taskOrder && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {task.taskOrder}
                  </span>
                )}
                <Circle className={`flex-shrink-0 ${canWork ? 'text-gray-400' : 'text-gray-300'}`} size={20} />
              </div>
              <div className="flex-1">
                <span className={`text-sm sm:text-base block ${canWork ? 'text-gray-900' : 'text-gray-500'}`}>
                  {task.name}
                  {!canWork && project.hasSequentialTasks && (
                    <span className="text-xs text-orange-600 ml-2">(waiting for previous task)</span>
                  )}
                </span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {project.hasSequentialTasks && task.taskOrder && (
                    <span className="bg-green-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {task.taskOrder}
                    </span>
                  )}
                  <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                </div>
                <div className="flex-1">
                  <span className="text-gray-600 text-sm line-through">
                    {task.name}
                  </span>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      Est: {task.estimatedHours}h → Actual: {task.actualHours}h
                    </span>
                    <span className="text-xs text-green-600">
                      ✓ {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
        <Plus size={16} />
        <span>Add Task</span>
      </button>
    </div>
  );
};

export default ProjectCard;

// ============================================================================
// frontend/src/components/Projects/ProjectForm.jsx
import React, { useState } from 'react';

const ProjectForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    priority: 'usual',
    category: 'professional',
    dueDate: '',
    hasSequentialTasks: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Add New Project</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Project name"
            className="border rounded-lg px-3 py-2 w-full"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          {/* Sequential Tasks Toggle */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="hasSequentialTasks"
              name="hasSequentialTasks"
              checked={formData.hasSequentialTasks}
              onChange={handleChange}
              className="rounded"
            />
            <label htmlFor="hasSequentialTasks" className="text-sm text-blue-800 font-medium">
              Tasks must be completed in order (sequential)
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select
              name="priority"
              className="border rounded-lg px-3 py-2 text-sm"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="immediate">Immediate</option>
              <option value="urgent">Urgent</option>
              <option value="usual">Usual</option>
              <option value="if you have time">If You Have Time</option>
              <option value="do whenever">Do Whenever</option>
            </select>
            <select
              name="category"
              className="border rounded-lg px-3 py-2 text-sm"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="professional">Professional</option>
              <option value="personal">Personal Interest</option>
              <option value="home">Home</option>
              <option value="social">Social</option>
            </select>
          </div>
          <input
            type="date"
            name="dueDate"
            className="border rounded-lg px-3 py-2"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1 sm:flex-none disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Project'}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex-1 sm:flex-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;

// ============================================================================
// frontend/src/components/Schedule/ScheduleTab.jsx
import React, { useState } from 'react';
import { useSchedule, useCommitToCalendar } from '../../hooks/useSchedule';
import { useCompleteTask } from '../../hooks/useProjects';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const ScheduleTab = () => {
  const [commitDays, setCommitDays] = useState(3);
  const [lastCommitted, setLastCommitted] = useState(null);
  
  const { data: scheduleData, isLoading, error } = useSchedule(commitDays);
  const completeTaskMutation = useCompleteTask();
  const commitToCalendarMutation = useCommitToCalendar();

  const priorityColors = {
    'immediate': 'bg-red-100 text-red-800 border-red-200',
    'urgent': 'bg-orange-100 text-orange-800 border-orange-200',
    'usual': 'bg-blue-100 text-blue-800 border-blue-200',
    'if you have time': 'bg-green-100 text-green-800 border-green-200',
    'do whenever': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleCommitToCalendar = async () => {
    try {
      await commitToCalendarMutation.mutateAsync({
        days: commitDays,
        scheduleData: scheduleData?.schedule
      });
      setLastCommitted(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to commit to calendar:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Generated Schedule</h2>
        
        {/* Calendar Commit Controls */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">Commit Schedule to Google Calendar</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-blue-800">Schedule next:</label>
              <select 
                value={commitDays} 
                onChange={(e) => setCommitDays(parseInt(e.target.value))}
                className="border border-blue-300 rounded px-2 py-1 text-sm bg-white"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
                <option value={7}>1 week</option>
              </select>
            </div>
            <button 
              onClick={handleCommitToCalendar}
              disabled={commitToCalendarMutation.isPending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto text-sm disabled:opacity-50"
            >
              📅 {commitToCalendarMutation.isPending ? 'Committing...' : 'Commit to Calendar'}
            </button>
          </div>
          {lastCommitted && (
            <p className="text-xs text-blue-700 mt-2">
              Last committed: {lastCommitted} ({commitDays} day{commitDays > 1 ? 's' : ''})
            </p>
          )}
          <p className="text-xs text-blue-600 mt-2">
            💡 Tip: Start with 2-3 days if you're feeling overwhelmed, or schedule a full week when you're in planning mode!
          </p>
        </div>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {scheduleData?.schedule?.slice(0, commitDays).map((day, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {day.dayName} - {day.date}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                Will be scheduled
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {day.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 flex-1">
                    <span className="font-medium text-gray-700 text-sm sm:text-base sm:w-24">{slot.time}</span>
                    <div className="flex-1">
                      <span className="text-gray-900 text-sm sm:text-base">{slot.task}</span>
                      {slot.project && (
                        <span className="text-xs sm:text-sm text-gray-600 ml-0 sm:ml-2 block sm:inline">
                          ({slot.project})
                        </span>
                      )}
                      {slot.blockInfo && (
                        <span className="text-xs text-blue-600 block sm:inline sm:ml-2">
                          {slot.blockInfo}
                          {slot.isSequential && slot.taskOrder && (
                            <span className="ml-1 bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 inline-flex items-center justify-center">
                              {slot.taskOrder}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {slot.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[slot.priority]}`}>
                        {slot.priority}
                      </span>
                    )}
                    {slot.taskId && (
                      <button
                        onClick={() => handleCompleteTask(slot.taskId)}
                        disabled={completeTaskMutation.isPending}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700 flex-shrink-0 disabled:opacity-50"
                      >
                        DONE!
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Preview of additional days */}
        {commitDays < (scheduleData?.schedule?.length || 0) && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm">
              {(scheduleData?.schedule?.length || 0) - commitDays} more day{(scheduleData?.schedule?.length || 0) - commitDays > 1 ? 's' : ''} available in preview
            </p>
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm mt-1"
              onClick={() => setCommitDays(Math.min(7, commitDays + 1))}
            >
              Show one more day
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;

// ============================================================================
// frontend/src/components/Settings/SettingsTab.jsx
import React, { useState } from 'react';

const SettingsTab = () => {
  const [workSchedule, setWorkSchedule] = useState({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '16:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '15:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { start: '10:00', end: '14:00', enabled: false }
  });

  const handleScheduleChange = (day, field, value) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // TODO: Save to backend
    console.log('Saving work schedule:', workSchedule);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Work Schedule Settings</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium mb-4">Set Your Available Work Hours</h3>
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(workSchedule).map(([day, schedule]) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 sm:w-32">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => handleScheduleChange(day, 'enabled', e.target.checked)}
                  className="rounded"
                />
                <span className="font-medium capitalize text-sm sm:text-base">{day}</span>
              </div>
              
              {schedule.enabled && (
                <div className="flex items-center space-x-2 ml-6 sm:ml-0">
                  <input
                    type="time"
                    value={schedule.start}
                    onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-gray-600">to</span>
                  <input
                    type="time"
                    value={schedule.end}
                    onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleSave}
          className="mt-4 sm:mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          Save Schedule Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;

// ============================================================================
// frontend/src/components/Common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

// ============================================================================
// frontend/src/components/Common/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">
                    Est: {task.estimatedHours}h ({Math.ceil(task.estimatedHours / 2)} blocks)
                  </span>
                  {task.actualHours > 0 && (
                    <span className="text-xs text-blue-600">
                      Time spent: {task.actualHours}h
                    </span>
                  )}
                </div>
              </div>
              {canWork && (
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={completeTaskMutation.isPending}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm font-medium flex-shrink-0 disabled:opacity-50"
                >
                  DONE!
                </button>
              )}
            </div>
          );
        })}
        
        {/* Completed Tasks */}
        {project.tasks.filter(task => task.completed).length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Completed</h4>
            {project.tasks.filter(task => task.completed).map(task => (
              <div key={task.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg mb-2">
                <div className="flex items-