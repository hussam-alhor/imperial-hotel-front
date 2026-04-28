import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRooms, addRoom, updateRoom, deleteRoom, getRoomById } from '../services/roomService.js';

// Hook لجلب الغرف
export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
};

// Hook لجلب غرفة واحدة
export const useRoom = (roomId) => {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => getRoomById(roomId),
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook لإضافة غرفة
export const useAddRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

// Hook لتحديث غرفة
export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }) => updateRoom(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

// Hook لحذف غرفة
export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};