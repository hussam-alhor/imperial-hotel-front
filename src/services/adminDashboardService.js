import api from '../lib/api.js';

export const getAdminReports = async ({ range }) => {
  const response = await api.get('/dashboard/admin/reports', {
    params: { range },
  });
  return response.data;
};

export const getAdminInvoices = async ({ paid, startDate, endDate, page, limit }) => {
  const response = await api.get('/dashboard/admin/invoices', {
    params: { paid, startDate, endDate, page, limit },
  });
  return response.data;
};

export const getAdminAuditLogs = async ({ userId, action, startDate, endDate, page, limit }) => {
  const response = await api.get('/dashboard/admin/audit-logs', {
    params: { userId, action, startDate, endDate, page, limit },
  });
  return response.data;
};

