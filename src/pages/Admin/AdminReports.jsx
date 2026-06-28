import React, { useMemo, useState } from 'react';
import { useAdminReports } from '../../hooks/useAdminDashboard.js';

const StatCard = ({ label, value, color = 'bg-primary' }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className={`mt-3 text-3xl font-extrabold ${color}`}>{value ?? 0}</div>
    </div>
  );
};

const AdminReports = () => {
  const [range, setRange] = useState('today');
  const { data, isLoading, error } = useAdminReports(range);

  const bookings = data?.bookings || {};
  const maintenanceBreakdown = data?.maintenanceBreakdown || {};

  const maintenanceList = useMemo(() => {
    const keys = Object.keys(maintenanceBreakdown);
    if (!keys.length) return [];
    return keys.map((k) => ({ status: k, count: maintenanceBreakdown[k] }));
  }, [maintenanceBreakdown]);

  if (isLoading) return <div className="py-10 text-center text-gray-500">Loading reports...</div>;
  if (error) return <div className="py-10 text-center text-red-600">Failed to load reports.</div>;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">تقارير الأدمن</h1>
          <p className="mt-2 text-sm text-gray-500">Revenue + عمليات اليوم + الصيانة</p>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'today', label: 'اليوم' },
            { key: 'month', label: 'هذا الشهر' },
            { key: 'last30', label: 'آخر 30 يوم' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                range === opt.key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Revenue" value={`${data?.revenue ?? 0} ر.س`} color="text-secondary" />
        <StatCard label="Arrivals" value={bookings.arrivalsToday ?? 0} color="text-primary" />
        <StatCard label="Departures" value={bookings.departuresToday ?? 0} color="text-indigo-600" />
        <StatCard label="Upcoming" value={bookings.upcomingBookings ?? 0} color="text-amber-600" />
        <StatCard
          label="Pending Requests"
          value={data?.pendingRequests ?? 0}
          color="text-rose-600"
        />
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Maintenance Breakdown</h3>

          <div className="mt-4 space-y-3">
            {maintenanceList.length === 0 ? (
              <div className="text-sm text-gray-500">No data.</div>
            ) : (
              (() => {
                const max = Math.max(...maintenanceList.map((x) => x.count || 0), 1);
                return maintenanceList.map((it) => {
                  const pct = ((it.count || 0) / max) * 100;
                  return (
                    <div key={it.status} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-gray-900">{it.status}</div>
                        <div className="text-sm font-bold text-primary">{it.count}</div>
                      </div>
                      <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Occupancy Rate</h3>
          <div className="mt-4 text-4xl font-extrabold text-secondary">
            {data?.occupancyRate ? `${Math.round(data.occupancyRate * 100)}%` : '0%'}
          </div>
          <div className="mt-2 text-sm text-gray-500">Booked rooms / Total rooms</div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-900">Bookings (visual)</h4>
            <div className="mt-3 space-y-3">
              {[
                { label: 'Arrivals', value: bookings.arrivalsToday ?? 0, color: 'bg-primary' },
                { label: 'Departures', value: bookings.departuresToday ?? 0, color: 'bg-indigo-600' },
                { label: 'Upcoming', value: bookings.upcomingBookings ?? 0, color: 'bg-amber-600' },
              ].map((row) => {
                const max = Math.max(
                  bookings.arrivalsToday ?? 0,
                  bookings.departuresToday ?? 0,
                  bookings.upcomingBookings ?? 0,
                  1
                );
                const pct = ((row.value || 0) / max) * 100;

                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-gray-600">{row.label}</div>
                      <div className="text-xs font-bold text-gray-900">{row.value}</div>
                    </div>
                    <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminReports;

