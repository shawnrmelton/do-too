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
