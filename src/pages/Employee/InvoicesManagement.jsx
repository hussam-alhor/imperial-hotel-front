import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/common/Modal.jsx';
import Table from '../../components/common/Table.jsx';
import Button from '../../components/common/Button.jsx';
import { toast } from 'react-hot-toast';
import { FiPlus, FiDollarSign, FiRepeat } from 'react-icons/fi';
import { confirmDelete } from '../../lib/sweetalert.js';

import { useRooms } from '../../hooks/useRooms.js';
import { useCustomers } from '../../hooks/useCustomers.js';
import { useBookings } from '../../hooks/useBookings.js';
import { useInvoices, useAddInvoice, useCheckoutInvoice, useUpdateInvoice } from '../../hooks/useInvoices.js';

import { z } from 'zod';

// Schema لإنشاء فاتورة جديدة (تم تبسيطه لمنع التكرار)
const createInvoiceSchema = z.object({
  booking: z.string().min(1, 'يرجى اختيار الحجز'),
  paidAmount: z.coerce.number().min(0, 'المبلغ لا يمكن أن يكون سالباً'),
  paymentMethod: z.enum(['كاش', 'بطاقة ائتمان', 'دفع إلكتروني', 'أخرى']),
});

// Schema لإضافة دفعة جديدة لفاتورة موجودة
const addPaymentSchema = z.object({
  newPaymentAmount: z.coerce.number().min(1, 'يرجى إدخال مبلغ صحيح أكبر من الصفر'),
  paymentMethod: z.enum(['كاش', 'بطاقة ائتمان', 'دفع إلكتروني', 'أخرى']),
});

const InvoicesManagement = () => {
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();

  const addInvoiceMutation = useAddInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const checkoutInvoiceMutation = useCheckoutInvoice();

  // States لإنشاء فاتورة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expectedTotal, setExpectedTotal] = useState(0);

  // States لإضافة دفعة (تسديد)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  const activeBookings = useMemo(() => {
    return (bookings || []).filter((b) => b.status === 'active');
  }, [bookings]);

  // نموذج الإنشاء
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: { paidAmount: 0, paymentMethod: 'كاش' },
  });

  // نموذج إضافة دفعة
  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    reset: resetPayment,
    formState: { errors: errorsPayment },
  } = useForm({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: { newPaymentAmount: 0, paymentMethod: 'كاش' },
  });

  // فتح نافذة الإنشاء وحساب الإجمالي المتوقع
  const handleOpenCreateInvoice = (booking) => {
    setSelectedBooking(booking);
    setIsAddModalOpen(true);

    const baseTotal = booking?.nights && booking?.room?.pricePerNight
      ? booking.nights * booking.room.pricePerNight
      : 0;
    setExpectedTotal(baseTotal);

    resetCreate({
      booking: booking.id || booking._id || '',
      paidAmount: 0,
      paymentMethod: 'كاش',
    });
  };

  // فتح نافذة تسديد الدفعة
  const handleOpenPayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentModalOpen(true);
    resetPayment({
      newPaymentAmount: invoice.remainingAmount || 0, // اقتراح تسديد كامل المتبقي
      paymentMethod: 'كاش',
    });
  };

  // إرسال طلب إنشاء الفاتورة
  const onAddInvoiceSubmit = async (data) => {
    try {
      const payload = {
        booking: data.booking,
        paidAmount: Number(data.paidAmount),
        // بناء مصفوفة المدفوعات خلف الكواليس
        payments: data.paidAmount > 0 ? [{
          amount: Number(data.paidAmount),
          method: data.paymentMethod,
          date: new Date(),
        }] : [],
        status: 'pending',
      };

      await addInvoiceMutation.mutateAsync(payload);
      toast.success('تم إنشاء الفاتورة بنجاح');
      setIsAddModalOpen(false);
      setSelectedBooking(null);
      resetCreate();
    } catch (error) {
      toast.error(error.message || 'فشل في إنشاء الفاتورة');
    }
  };
const onAddPaymentSubmit = async (data) => {
    if (data.newPaymentAmount > selectedInvoiceForPayment.remainingAmount) {
        return toast.error('المبلغ المدخل أكبر من المبلغ المتبقي!');
    }

    try {
        const newPaymentAmount = Number(data.newPaymentAmount);
        
        const newPayment = {
            amount: newPaymentAmount,
            method: data.paymentMethod,
            date: new Date()
        };

        // تنظيف المصفوفة من أي حقول تعريفية (id, _id)
        const cleanExistingPayments = (selectedInvoiceForPayment.payments || []).map(payment => {
            const { _id, id, ...rest } = payment; // نقوم باستبعاد id و _id
            return rest;
        });

        const payload = {
            paidAmount: (selectedInvoiceForPayment.paidAmount || 0) + newPaymentAmount,
            payments: [
                ...cleanExistingPayments,
                newPayment
            ]
        };

        await updateInvoiceMutation.mutateAsync({
            id: selectedInvoiceForPayment.id || selectedInvoiceForPayment._id,
            data: payload
        });

        toast.success('تم تسجيل الدفعة بنجاح');
        setIsPaymentModalOpen(false);
        setSelectedInvoiceForPayment(null);
        resetPayment();
    } catch (error) {
        toast.error(error.message || 'فشل في تسجيل الدفعة');
    }
};

  // إرسال طلب الـ Checkout
  const handleCheckout = async (invoiceId) => {
    const isConfirmed = await confirmDelete(
      'هل تريد إتمام عملية الدفع (Checkout)؟',
      'سيتم إنهاء الحجز وتحديث حالة الغرفة والفاتورة.'
    );

    if (!isConfirmed) return;

    try {
      await checkoutInvoiceMutation.mutateAsync(invoiceId);
      toast.success('تمت عملية الـ Checkout بنجاح، الغرفة الآن متاحة.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'فشل في عملية الـ Checkout');
    }
  };

  // تعريف أعمدة الجدول
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
        <span className={inv.remainingAmount > 0 ? "text-red-600 font-bold" : "text-gray-500"}>
          {inv.remainingAmount ?? 0} ر.س
        </span>
      ),
    },
    {
      header: 'الحالة',
      render: (inv) => {
        const isPaid = inv.status === 'paid' || inv.remainingAmount === 0;
        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isPaid ? 'مدفوعة' : 'معلقة / غير مكتملة'}
          </span>
        );
      },
    },
    {
      header: 'الإجراءات',
      render: (inv) => {
        const hasBalance = inv.remainingAmount > 0;
        const isCheckedOut = inv.status === 'paid';

        return (
          <div className="flex gap-2">
            {/* زر إضافة دفعة */}
            <Button
              variant="secondary"
              size="sm"
              disabled={isCheckedOut || !hasBalance}
              onClick={() => handleOpenPayment(inv)}
              title={!hasBalance ? "الفاتورة مسددة بالكامل" : "إضافة دفعة"}
            >
              <FiDollarSign size={16} />
            </Button>

            {/* زر Checkout */}
            <Button
              variant="outline"
              size="sm"
              // المنطق الأساسي: ممنوع الخروج إذا كان هناك متبقي أو تم الخروج مسبقاً
              disabled={isCheckedOut || hasBalance}
              onClick={() => handleCheckout(inv.id || inv._id)}
              loading={checkoutInvoiceMutation.isPending}
              title={hasBalance ? "يجب تسديد المبلغ المتبقي أولاً" : "إتمام الـ Checkout"}
              className={hasBalance ? "opacity-50 cursor-not-allowed" : ""}
            >
              <FiRepeat size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">إدارة الفواتير والـ Checkout</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            إدارة الدفعات، تسديد المبالغ المتبقية، وإنهاء حجوزات النزلاء.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">سجل الفواتير</h2>
          </div>
        </div>

        <Table
          columns={columns}
          data={invoices}
          loading={invoicesLoading}
          emptyMessage="لا توجد فواتير مسجلة في النظام"
        />
      </div>

      {/* زر إنشاء فاتورة سريعة */}
      <div className="flex flex-col gap-2 mt-8">
        <h2 className="text-lg font-semibold text-gray-900">حجوزات نشطة بحاجة لفوترة</h2>
        <div className="flex flex-wrap gap-3">
          {activeBookings.length > 0 ? (
            activeBookings.slice(0, 6).map((b) => (
              <Button key={b._id || b.id} onClick={() => handleOpenCreateInvoice(b)} variant="secondary">
                {b.customer?.name || '-'} (غرفة: {b.room?.roomNumber || '-'})
                <FiPlus className="mr-2" size={18} />
              </Button>
            ))
          ) : (
            <div className="text-sm text-gray-500">لا توجد حجوزات نشطة غير مفوترة حالياً.</div>
          )}
        </div>
      </div>

      {/* Modal 1: إنشاء فاتورة */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          setSelectedBooking(null);
          resetCreate();
        }}
        title="إنشاء فاتورة مبدئية"
        size="lg"
      >
        {selectedBooking ? (
          <form onSubmit={handleSubmitCreate(onAddInvoiceSubmit)} className="space-y-4">
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
              <p className="text-sm text-gray-700">العميل: <span className="font-bold">{selectedBooking.customer?.name}</span></p>
              <p className="text-sm text-gray-700">عدد الليالي: <span className="font-bold">{selectedBooking.nights}</span></p>
              <p className="text-lg text-primary mt-2">
                إجمالي الفاتورة المتوقع: <span className="font-bold">{expectedTotal} ر.س</span>
              </p>
            </div>

            <input type="hidden" {...registerCreate('booking')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدفعة المقدمة (المدفوع الآن)</label>
                <input
                  type="number"
                  {...registerCreate('paidAmount')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="0"
                />
                {errorsCreate.paidAmount && (
                  <p className="mt-1 text-sm text-red-600">{errorsCreate.paidAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select
                  {...registerCreate('paymentMethod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="كاش">كاش</option>
                  <option value="بطاقة ائتمان">بطاقة ائتمان</option>
                  <option value="دفع إلكتروني">دفع إلكتروني (Apple Pay / Mada)</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
              <Button type="submit" loading={addInvoiceMutation.isPending}>إصدار الفاتورة</Button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Modal 2: إضافة دفعة (تسديد) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onRequestClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInvoiceForPayment(null);
          resetPayment();
        }}
        title="تسديد مبلغ من الفاتورة"
        size="md"
      >
        {selectedInvoiceForPayment && (
          <form onSubmit={handleSubmitPayment(onAddPaymentSubmit)} className="space-y-4">
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">إجمالي الفاتورة:</span>
                <span className="font-medium">{selectedInvoiceForPayment.totalAmount} ر.س</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">المدفوع مسبقاً:</span>
                <span className="font-medium text-green-600">{selectedInvoiceForPayment.paidAmount} ر.س</span>
              </div>
              <div className="flex justify-between text-base mt-2 pt-2 border-t border-amber-200">
                <span className="font-bold text-gray-800">المبلغ المتبقي:</span>
                <span className="font-bold text-red-600">{selectedInvoiceForPayment.remainingAmount} ر.س</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ الدفعة الجديدة</label>
              <input
                type="number"
                {...registerPayment('newPaymentAmount')}
                max={selectedInvoiceForPayment.remainingAmount} // منع كتابة رقم أكبر في الـ UI
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              {errorsPayment.newPaymentAmount && (
                <p className="mt-1 text-sm text-red-600">{errorsPayment.newPaymentAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
              <select
                {...registerPayment('paymentMethod')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="كاش">كاش</option>
                <option value="بطاقة ائتمان">بطاقة ائتمان</option>
                <option value="دفع إلكتروني">دفع إلكتروني (Apple Pay / Mada)</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>إلغاء</Button>
              <Button type="submit" loading={updateInvoiceMutation.isPending}>حفظ الدفعة</Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default InvoicesManagement;