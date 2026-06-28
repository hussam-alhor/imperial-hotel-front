import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboardService.js';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000, // 1 دقيقة
  });
};

