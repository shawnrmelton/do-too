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
