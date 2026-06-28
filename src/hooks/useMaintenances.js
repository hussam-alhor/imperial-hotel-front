import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllMaintenances,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceById,
} from '../services/maintenanceService.js';

export const useMaintenances = () => {
  return useQuery({
    queryKey: ['maintenances'],
    queryFn: getAllMaintenances,
    staleTime: 60 * 1000,
  });
};

export const useMaintenance = (maintenanceId) => {
  return useQuery({
    queryKey: ['maintenances', maintenanceId],
    queryFn: () => getMaintenanceById(maintenanceId),
    enabled: !!maintenanceId,
    staleTime: 60 * 1000,
  });
};

export const useAddMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMaintenance,
    onSuccess: async () => {
      // أجبر Refresh للـ Rooms حتى تتحدث الحالة مباشرة بدون Reload للصفحة
      await queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      await queryClient.refetchQueries({ queryKey: ['rooms'], exact: true });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maintenanceId, data }) => updateMaintenance(maintenanceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    },
  });
};


