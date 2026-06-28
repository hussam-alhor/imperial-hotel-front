import React, { useState } from 'react';
import Table from '../../components/common/Table.jsx';
import { useAdminAuditLogs } from '../../hooks/useAdminDashboard.js';

const AdminAuditLogs = () => {
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params = {
    userId: userId || undefined,
    action: action || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page: 1,
    limit: 60,
  };

  const { data, isLoading, error } = useAdminAuditLogs(params);
  const logs = data?.logs || [];

  const columns = [
    {
      header: 'الوقت',
      render: (l) => <span>{l.createdAt ? new Date(l.createdAt).toLocaleString('ar-SA') : '-'}</span>,
    },
    {
      header: 'المستخدم',
      render: (l) => l.user?.name || l.user?.userName || l.user?._id || '-',
    },
    {
      header: 'Action',
      render: (l) => <span className="font-medium">{l.action || '-'}</span>,
    },
    {
      header: 'Details',
      render: (l) => {
        const body = l?.details?.body;
        const params = l?.details?.params;

        return (
          <div className="space-y-2">
            {params && Object.keys(params).length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-gray-500">Params</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(params, null, 2)}</pre>
              </div>
            )}

            {body && Object.keys(body).length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-gray-500">Body</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(body, null, 2)}</pre>
              </div>
            )}

            {(!body || Object.keys(body).length === 0) && (!params || Object.keys(params).length === 0) && (
              <span className="text-xs text-gray-500">-</span>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div className="py-10 text-center text-gray-500">Loading logs...</div>;
  if (error) return <div className="py-10 text-center text-red-600">Failed to load logs.</div>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-sm text-gray-500">Activity history for admin</p>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">User ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Action contains</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
              placeholder="e.g. DELETE_BOOKING"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <Table
          columns={columns}
          data={logs}
          loading={isLoading}
          emptyMessage="لا توجد سجلات حسب الفلتر"
        />
      </div>
    </section>
  );
};

export default AdminAuditLogs;

