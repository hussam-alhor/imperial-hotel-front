import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDashboard } from '../../hooks/useDashboard.js';
import { useMaintenances } from '../../hooks/useMaintenances.js';

const StatCard = ({ label, value, color = 'bg-primary' }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className={`mt-3 text-3xl font-extrabold ${color}`}>{value ?? 0}</div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  const { data, isLoading, error } = useDashboard();
  const { data: maintenances = [], isLoading: maintLoading } = useMaintenances();

  const stats = data?.stats ?? {};
  const arrivals = data?.today?.arrivals ?? [];
  const departures = data?.today?.departures ?? [];
  const financialData = data?.financialData ?? 0;

  if (isLoading) {
    return (
      <div className="py-10 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-600">
        Failed to load dashboard stats.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* ======= Summary ======= */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500">System status & daily operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Rooms" value={stats.totalRooms} color="text-primary" />
        <StatCard label="Available" value={stats.available} color="text-green-600" />
        <StatCard label="Booked" value={stats.booked} color="text-indigo-600" />
        <StatCard label="Maintenance" value={stats.maintenance} color="text-amber-600" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} color="text-rose-600" />
      </div>

      {/* ======= Financial (Admin only) ======= */}
      {role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="text-xs font-semibold text-gray-500">Total Paid Amount</div>
            <div className="mt-3 text-4xl font-extrabold text-secondary">
              {financialData}
            </div>
            <div className="mt-2 text-sm text-gray-500">Shown for Admin only</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Role</div>
            <div className="mt-3 text-2xl font-bold text-gray-900">Admin</div>
          </div>
        </div>
      )}

      {/* ======= Daily Operations (Employee & Admin) ======= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Arrivals Today</h3>
            <span className="text-xs font-semibold text-gray-500">{arrivals.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {arrivals.length === 0 ? (
              <div className="text-sm text-gray-500">No arrivals today.</div>
            ) : (
              arrivals.slice(0, 8).map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {b.customer?.fullName || b.customer?.name || 'Unknown Customer'}
                    </div>
                    <div className="text-xs text-gray-500">Booking: {b._id?.slice?.(-6) ?? b._id}</div>
                  </div>
                  <div className="text-xs font-semibold text-primary">Check-in</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Departures Today</h3>
            <span className="text-xs font-semibold text-gray-500">{departures.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {departures.length === 0 ? (
              <div className="text-sm text-gray-500">No departures today.</div>
            ) : (
              departures.slice(0, 8).map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {b.customer?.fullName || b.customer?.name || 'Unknown Customer'}
                    </div>
                    <div className="text-xs text-gray-500">Booking: {b._id?.slice?.(-6) ?? b._id}</div>
                  </div>
                  <div className="text-xs font-semibold text-primary">Check-out</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ======= Maintenance Rooms ======= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-gray-900">Maintenance Rooms</h3>
            <span className="text-xs font-semibold text-gray-500">{maintenances.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {maintLoading ? (
              <div className="text-sm text-gray-500">Loading maintenances...</div>
            ) : maintenances.length === 0 ? (
              <div className="text-sm text-gray-500">No maintenances found.</div>
            ) : (
              maintenances.slice(0, 6).map((m) => (
                <div
                  key={m._id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {m.room?.roomNumber || m.room?.roomNumber || 'Unknown Room'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {m.startDate ? new Date(m.startDate).toLocaleDateString('ar-SA') : '-'} →{' '}
                      {m.endDate ? new Date(m.endDate).toLocaleDateString('ar-SA') : '-'}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {m.description || '-'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        m.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : m.status === 'scheduled'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Who Sees Maintenance?</h3>
          <p className="mt-2 text-sm text-gray-600">
            لأن API /api/maintenances يستخدم verifyTokenAndEmployee، في الحالتين Admin و Employee
            لديهم صلاحية عرض بيانات الصيانة داخل Dashboard.
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default Dashboard;

