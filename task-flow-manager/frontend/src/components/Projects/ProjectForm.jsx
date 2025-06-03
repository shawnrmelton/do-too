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
