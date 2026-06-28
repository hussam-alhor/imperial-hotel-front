import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  addBooking,
  updateBooking,
  cancelBooking,
  getBookingById,
} from '../services/bookingService.js';

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBooking = (bookingId) => {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }) => updateBooking(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

