import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllCleaningSchedules,
  addCleaningSchedule,
  updateCleaningSchedule,
  deleteCleaningSchedule,
} from '../services/cleaningScheduleService.js';

export const useCleaningSchedules = () => {
  return useQuery({
    queryKey: ['cleaningSchedules'],
    queryFn: getAllCleaningSchedules,
    staleTime: 60 * 1000,
  });
};

export const useAddCleaningSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCleaningSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaningSchedules'] });
    },
  });
};

export const useUpdateCleaningSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cleaningScheduleId, data }) => updateCleaningSchedule(cleaningScheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaningSchedules'] });
    },
  });
};

export const useDeleteCleaningSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCleaningSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaningSchedules'] });
    },
  });
};

