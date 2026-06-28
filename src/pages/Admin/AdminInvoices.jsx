import React, { useState } from 'react';
import Table from '../../components/common/Table.jsx';
import Button from '../../components/common/Button.jsx';
import { useAdminInvoices } from '../../hooks/useAdminDashboard.js';

const toCsv = (rows, headers) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/["\n,]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };

  const headerLine = headers.map(escape).join(',');
  const lines = rows.map((r) => headers.map((h) => escape(r[h] ?? '')).join(','));
  return [headerLine, ...lines].join('\n');
};

const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const AdminInvoices = () => {
  const [paid, setPaid] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params = {
    paid: paid === 'all' ? undefined : paid,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page: 1,
    limit: 50,
  };

  const { data, isLoading, error } = useAdminInvoices(params);

  const invoices = data?.invoices || [];
  const summary = data?.summary || { totalPaid: 0, totalPending: 0 };

  const columns = [
    {
      header: 'رقم الفاتورة',
      render: (inv) => <span className="font-medium">{inv.invoiceNumber || '-'}</span>,
    },
    {
      header: 'العميل',
      render: (inv) => inv.customer?.name || inv.customer?.idNumber || '-',
    },
    {
      header: 'الغرفة',
      render: (inv) => inv.room?.roomNumber || '-',
    },
    {
      header: 'الإجمالي',
      render: (inv) => <span className="text-gray-900">{inv.totalAmount ?? 0} ر.س</span>,
    },
    {
      header: 'المدفوع',
      render: (inv) => <span className="text-green-600">{inv.paidAmount ?? 0} ر.س</span>,
    },
    {
      header: 'المتبقي',
      render: (inv) => (
        <span className={inv.remainingAmount > 0 ? 'text-red-600 font-bold' : 'text-gray-500'}>
          {inv.remainingAmount ?? 0} ر.س
        </span>
      ),
    },
    {
      header: 'الحالة',
      render: (inv) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            inv.status === 'paid'
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {inv.status === 'paid' ? 'مدفوعة' : 'معلقة / غير مكتملة'}
        </span>
      ),
    },
  ];

  if (isLoading) return <div className="py-10 text-center text-gray-500">Loading invoices...</div>;
  if (error) return <div className="py-10 text-center text-red-600">Failed to load invoices.</div>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">فواتير الأدمن</h1>
        <p className="mt-2 text-sm text-gray-500">Summary + Filters + list</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Total Paid</div>
          <div className="mt-3 text-3xl font-extrabold text-green-700">{summary.totalPaid} ر.س</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Total Pending</div>
          <div className="mt-3 text-3xl font-extrabold text-red-700">{summary.totalPending} ر.س</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Count (filtered)</div>
          <div className="mt-3 text-3xl font-extrabold text-primary">{data?.totalCount ?? 0}</div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'paid', label: 'مدفوعة' },
              { key: 'unpaid', label: 'غير مدفوعة' },
            ].map((opt) => (
              <Button
                key={opt.key}
                variant={paid === opt.key ? 'primary' : 'outline'}
                onClick={() => setPaid(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">سجل الفواتير</h2>
            <p className="text-sm text-gray-500">يمكنك تصدير النتائج حسب الفلاتر إلى CSV</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              const headers = [
                'invoiceNumber',
                'createdAt',
                'customer',
                'room',
                'totalAmount',
                'paidAmount',
                'remainingAmount',
                'status',
              ];

              const rows = (invoices || []).map((inv) => ({
                invoiceNumber: inv.invoiceNumber ?? '',
                createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : '',
                customer: inv.customer?.name || inv.customer?.idNumber || '',
                room: inv.room?.roomNumber || '',
                totalAmount: inv.totalAmount ?? 0,
                paidAmount: inv.paidAmount ?? 0,
                remainingAmount: inv.remainingAmount ?? 0,
                status: inv.status ?? '',
              }));

              const csv = toCsv(
                rows,
                headers
              );

              const filename = `admin-invoices_${new Date().toISOString().slice(0, 10)}.csv`;
              downloadTextFile(filename, csv);
            }}
          >
            تصدير CSV
          </Button>
        </div>

        <Table
          columns={columns}
          data={invoices}
          loading={isLoading}
          emptyMessage="لا توجد فواتير حسب الفلتر"
        />
      </div>
    </section>
  );
};

export default AdminInvoices;

