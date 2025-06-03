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
