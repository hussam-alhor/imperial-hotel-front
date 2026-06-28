import { useQuery } from '@tanstack/react-query';
import { getAdminReports, getAdminInvoices, getAdminAuditLogs } from '../services/adminDashboardService.js';

export const useAdminReports = (range) => {
  return useQuery({
    queryKey: ['adminReports', range],
    queryFn: () => getAdminReports({ range }),
    enabled: !!range,
    staleTime: 60 * 1000,
  });
};

export const useAdminInvoices = (params) => {
  return useQuery({
    queryKey: ['adminInvoices', params],
    queryFn: () => getAdminInvoices(params),
    enabled: !!params,
    staleTime: 60 * 1000,
  });
};

export const useAdminAuditLogs = (params) => {
  return useQuery({
    queryKey: ['adminAuditLogs', params],
    queryFn: () => getAdminAuditLogs(params),
    enabled: !!params,
    staleTime: 60 * 1000,
  });
};

