import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addBookingSchema, updateBookingSchema } from '../../schema/bookingSchema.js';
import { useRooms } from '../../hooks/useRooms.js';
import { useCustomers } from '../../hooks/useCustomers.js';
import { useBookings, useAddBooking, useUpdateBooking, useCancelBooking } from '../../hooks/useBookings.js';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { confirmDelete } from '../../lib/sweetalert.js';

const RoomsBookingManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();

  const addBookingMutation = useAddBooking();
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    watch: watchAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addBookingSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateBookingSchema),
  });

  const availableRooms = useMemo(() => {
    return (rooms || []).filter((r) => r.status === 'متاحة');
  }, [rooms]);

  // فلترة الحجوزات حسب الحالة
  const filteredBookings = useMemo(() => {
    return (bookings || []).filter((b) => b.status === 'active');
  }, [bookings]);

  const openEditModal = (booking) => {
    setEditingBooking(booking);

    resetEdit({
      customer: booking.customer?._id || booking.customer?._id || booking.customer,
      room: booking.room?._id || booking.room,
      checkInDate: booking.checkInDate ? new Date(booking.checkInDate) : undefined,
      checkOutDate: booking.checkOutDate ? new Date(booking.checkOutDate) : undefined,
      nights: booking.nights,
      initialPayment: booking.initialPayment,
      specialRequests: booking.specialRequests,
      status: booking.status,
    });
  };

  const onAddSubmit = async (data) => {
    try {
      // specialRequests في الباك مصفوفة Strings
      let payload = { ...data };

      // تحويل specialRequests إذا كانت نص
      if (typeof payload.specialRequests === 'string') {
        payload.specialRequests = [payload.specialRequests];
      }

      await addBookingMutation.mutateAsync(payload);
      toast.success('تم حجز الغرفة بنجاح');
      setIsAddModalOpen(false);
      resetAdd();
    } catch (error) {
      toast.error(error.message || 'فشل في حجز الغرفة');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      let payload = { ...data };
      if (typeof payload.specialRequests === 'string') {
        payload.specialRequests = [payload.specialRequests];
      }

      await updateBookingMutation.mutateAsync({
        bookingId: editingBooking.id || editingBooking._id,
        data: payload,
      });
      toast.success('تم تحديث الحجز بنجاح');
      setEditingBooking(null);
      resetEdit();
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث الحجز');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const bookingIdentifier = bookingId || editingBooking?.id || editingBooking?._id;

    const isConfirmed = await confirmDelete(
      'هل أنت متأكد من إلغاء الحجز؟',
      'لن تتمكن من استعادة الحجز بعد الإلغاء!'
    );

    if (!isConfirmed) return;

    try {
      await cancelBookingMutation.mutateAsync(bookingIdentifier);
      toast.success('تم إلغاء الحجز');
    } catch (error) {
      toast.error(error.message || 'فشل في إلغاء الحجز');
    }
  };

  const columns = [
    {
      header: 'العميل',
      render: (b) => b.customer?.name || b.customer?.idNumber || b.customer,
    },
    {
      header: 'الغرفة',
      render: (b) => b.room?.roomNumber || b.room?.roomNumber || b.room,
    },
    {
      header: 'تاريخ الدخول',
      render: (b) => (b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('ar-SA') : '-'),
    },
    {
      header: 'تاريخ الخروج',
      render: (b) => (b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString('ar-SA') : '-'),
    },
    {
      header: 'عدد الليالي',
      render: (b) => b.nights,
    },
    {
      header: 'الدفع المبدئي',
      render: (b) => `${b.initialPayment} ريال`,
    },
    {
      header: 'الحالة',
      render: (b) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            b.status === 'active'
              ? 'bg-yellow-100 text-yellow-800'
              : b.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
          }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      render: (booking) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setViewingBooking(booking)}>
            <FiEye size={16} />
          </Button>

          <Button variant="outline" size="sm" onClick={() => openEditModal(booking)}>
            <FiEdit2 size={16} />
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancelBooking(booking.id || booking._id)}
            loading={cancelBookingMutation.isPending}
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const specialRequestsValue = watchAdd('specialRequests');

  const renderSpecialRequestsInput = (
    {
      register,
      errors,
    }
  ) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الطلبات الخاصة (مفصولة بفواصل)
        </label>
        <input
          type="text"
          {...register('specialRequests')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="مثال: إعاقة/عناية خاصة"
        />
        {errors?.specialRequests && (
          <p className="mt-1 text-sm text-red-600">{errors.specialRequests.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">حجز الغرف</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            من هنا يمكنك إنشاء حجوزات الغرف وتحديثها وإلغائها.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus size={20} className="ml-2" />
          إضافة حجز
        </Button>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">قائمة الحجوزات</h2>
            <p className="text-sm text-gray-500">يمكنك متابعة جميع حجوزات العملاء.</p>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredBookings}
          loading={bookingsLoading}
          emptyMessage="لا توجد حجوزات نشطة"
        />
      </div>

      {/* Modal لإضافة حجز */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
        }}
        title="إضافة حجز جديد"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
            <select
              {...registerAdd('customer')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر العميل</option>
              {customersLoading ? null : customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.idNumber}
                </option>
              ))}
            </select>
            {errorsAdd.customer && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.customer.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الغرفة</label>
            <select
              {...registerAdd('room')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر الغرفة المتاحة</option>
              {availableRooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.category})
                </option>
              ))}
            </select>
            {errorsAdd.room && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.room.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدخول</label>
              <input
                type="date"
                {...registerAdd('checkInDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsAdd.checkInDate && (
                <p className="mt-1 text-sm text-red-600">{errorsAdd.checkInDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الخروج</label>
              <input
                type="date"
                {...registerAdd('checkOutDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsAdd.checkOutDate && (
                <p className="mt-1 text-sm text-red-600">{errorsAdd.checkOutDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عدد الليالي</label>
            <input
              type="number"
              {...registerAdd('nights')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.nights && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.nights.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الدفع المبدئي</label>
            <input
              type="number"
              {...registerAdd('initialPayment')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.initialPayment && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.initialPayment.message}</p>
            )}
          </div>

          {renderSpecialRequestsInput({ register: registerAdd, errors: errorsAdd })}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetAdd();
              }}
            >
              إلغاء
            </Button>

            <Button type="submit" loading={addBookingMutation.isPending}>
              إنشاء الحجز
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal لتحديث حجز */}
      <Modal
        isOpen={!!editingBooking}
        onRequestClose={() => {
          setEditingBooking(null);
          resetEdit();
        }}
        title="تحديث الحجز"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العميل</label>
            <select
              {...registerEdit('customer')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">(اختياري)</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.idNumber}
                </option>
              ))}
            </select>
            {errorsEdit.customer && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.customer.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الغرفة</label>
            <select
              {...registerEdit('room')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">(اختياري)</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.status})
                </option>
              ))}
            </select>
            {errorsEdit.room && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.room.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدخول</label>
              <input
                type="date"
                {...registerEdit('checkInDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsEdit.checkInDate && (
                <p className="mt-1 text-sm text-red-600">{errorsEdit.checkInDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الخروج</label>
              <input
                type="date"
                {...registerEdit('checkOutDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsEdit.checkOutDate && (
                <p className="mt-1 text-sm text-red-600">{errorsEdit.checkOutDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد الليالي</label>
              <input
                type="number"
                {...registerEdit('nights')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsEdit.nights && (
                <p className="mt-1 text-sm text-red-600">{errorsEdit.nights.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدفع المبدئي</label>
              <input
                type="number"
                {...registerEdit('initialPayment')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsEdit.initialPayment && (
                <p className="mt-1 text-sm text-red-600">{errorsEdit.initialPayment.message}</p>
              )}
            </div>
          </div>

          {renderSpecialRequestsInput({ register: registerEdit, errors: errorsEdit })}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingBooking(null);
                resetEdit();
              }}
            >
              إلغاء
            </Button>

            <Button type="submit" loading={updateBookingMutation.isPending}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal لعرض تفاصيل الحجز */}
      <Modal
        isOpen={!!viewingBooking}
        onRequestClose={() => setViewingBooking(null)}
        title="تفاصيل الحجز"
        size="lg"
      >
        {viewingBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">العميل</p>
                <p className="text-lg font-semibold text-gray-900">
                  {viewingBooking.customer?.name || '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الغرفة</p>
                <p className="text-lg font-semibold text-gray-900">
                  {viewingBooking.room?.roomNumber || '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">تاريخ الدخول</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingBooking.checkInDate ? new Date(viewingBooking.checkInDate).toLocaleString('ar-SA') : '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">تاريخ الخروج</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingBooking.checkOutDate ? new Date(viewingBooking.checkOutDate).toLocaleString('ar-SA') : '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">عدد الليالي</p>
                <p className="text-lg font-semibold text-gray-900">{viewingBooking.nights}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الدفع المبدئي</p>
                <p className="text-lg font-semibold text-primary">{viewingBooking.initialPayment} ريال</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">الطلبات الخاصة</p>
              {Array.isArray(viewingBooking.specialRequests) && viewingBooking.specialRequests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingBooking.specialRequests.map((req, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      {req}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingBooking(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomsBookingManagement;

