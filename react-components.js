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
                <div className="flex items-center space-x-4 mt-1">
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