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
