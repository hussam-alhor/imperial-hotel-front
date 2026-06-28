import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  addCleaningScheduleSchema,
  updateCleaningScheduleSchema,
} from '../../schema/cleaningScheduleSchema.js';

import {
  useCleaningSchedules,
  useAddCleaningSchedule,
  useUpdateCleaningSchedule,
  useDeleteCleaningSchedule,
} from '../../hooks/useCleaningSchedules.js';

import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

import { confirmDelete } from '../../lib/sweetalert.js';
import { useRooms } from '../../hooks/useRooms.js';

const statusToLabel = (s) => {
  if (!s) return '-';
  const map = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return map[s] || s;
};

const CleaningSchedulesManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [viewingSchedule, setViewingSchedule] = useState(null);

  const { data: cleaningSchedules = [], isLoading } = useCleaningSchedules();
  const addMutation = useAddCleaningSchedule();
  const updateMutation = useUpdateCleaningSchedule();
  const deleteMutation = useDeleteCleaningSchedule();

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addCleaningScheduleSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateCleaningScheduleSchema),
  });

  const roomsOptions = useMemo(() => rooms || [], [rooms]);
  const availableRoomsOptions = useMemo(
    () => roomsOptions.filter((r) => r.status === 'متاحة'),
    [roomsOptions]
  );

  const onAddSubmit = async (data) => {
    try {
      await addMutation.mutateAsync(data);
      toast.success('تم إضافة جدول التنظيف بنجاح');
      setIsAddModalOpen(false);
      resetAdd();
    } catch (error) {
      toast.error(error.message || 'فشل في إضافة جدول التنظيف');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      const cleaningScheduleId = editingSchedule?.id || editingSchedule?._id;
      if (!cleaningScheduleId) return;

      await updateMutation.mutateAsync({
        cleaningScheduleId,
        data,
      });
      toast.success('تم تحديث جدول التنظيف بنجاح');
      setEditingSchedule(null);
      resetEdit();
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث جدول التنظيف');
    }
  };

  const handleDelete = async (cleaningScheduleId) => {
    const isConfirmed = await confirmDelete(
      'هل أنت متأكد من حذف جدول التنظيف؟',
      'لن تتمكن من استعادة هذا الجدول!'
    );
    if (!isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(cleaningScheduleId);
      toast.success('تم حذف جدول التنظيف بنجاح');
    } catch (error) {
      toast.error(error.message || 'فشل في حذف جدول التنظيف');
    }
  };

  const openEditModal = (s) => {
    setEditingSchedule(s);
    resetEdit({
      room: s.room?._id || s.room,
      scheduledDate: s.scheduledDate ? new Date(s.scheduledDate) : undefined,
      status: s.status,
      notes: s.notes,
    });
  };

  const columns = [
    {
      header: 'الغرفة',
      render: (s) => (
        <div className="flex flex-col items-start justify-start gap-1">
          <span>{s.room?.roomNumber || '-'}</span>
        </div>
      ),
    },
    {
      header: 'تاريخ الجدولة',
      render: (s) => (
        <div className="flex flex-col items-start justify-start gap-1">
          <span>
            {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('ar-SA') : '-'}
          </span>
        </div>
      ),
    },
    {
      header: 'الحالة',
      render: (s) => (
        <div className="flex flex-col items-start justify-center">
          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {statusToLabel(s.status)}
          </span>
        </div>
      ),
    },
    {
      header: 'ملاحظات',
      render: (s) => (
        <div className="flex flex-col items-start justify-center">
          <span>{s.notes || '-'}</span>
        </div>
      ),
    },

    {
      header: 'الإجراءات',
      render: (s) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setViewingSchedule(s)}>
            <FiEye size={16} />
          </Button>

          <Button variant="outline" size="sm" onClick={() => openEditModal(s)}>
            <FiEdit2 size={16} />
          </Button>

          <Button
            variant="danger"
            size="sm"
            loading={deleteMutation.isPending}
            onClick={() => handleDelete(s.id || s._id)}
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">إدارة جداول التنظيف</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">من هنا يمكنك إضافة وتعديل وحذف جداول التنظيف.</p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus size={20} className="ml-2" />
          إضافة جدول تنظيف
        </Button>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <Table
          columns={columns}
          data={cleaningSchedules}
          loading={isLoading}
          emptyMessage="لا توجد جداول تنظيف"
        />
      </div>

      {/* Modal add */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
        }}
        title="إضافة جدول تنظيف جديد"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الغرفة</label>
            <select
              {...registerAdd('room')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر الغرفة</option>
              {roomsLoading
                ? null
                : availableRoomsOptions.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomNumber} ({r.status})
                    </option>
                  ))}
            </select>
            {errorsAdd.room && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.room.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الجدولة</label>
            <input
              type="date"
              {...registerAdd('scheduledDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.scheduledDate && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.scheduledDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              {...registerAdd('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
            </select>
            {errorsAdd.status && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea
              {...registerAdd('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.notes && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.notes.message}</p>
            )}
          </div>

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
            <Button type="submit" loading={addMutation.isPending}>
              إضافة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal edit */}
      <Modal
        isOpen={!!editingSchedule}
        onRequestClose={() => {
          setEditingSchedule(null);
          resetEdit();
        }}
        title="تحديث جدول التنظيف"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الغرفة (اختياري)</label>
            <select
              {...registerEdit('room')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">(اختياري)</option>
              {roomsLoading
                ? null
                : roomsOptions.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomNumber} ({r.status})
                    </option>
                  ))}
            </select>
            {errorsEdit.room && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.room.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الجدولة (اختياري)</label>
            <input
              type="date"
              {...registerEdit('scheduledDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.scheduledDate && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.scheduledDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              {...registerEdit('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">(اختياري)</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
            </select>
            {errorsEdit.status && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
            <textarea
              {...registerEdit('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.notes && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingSchedule(null);
                resetEdit();
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal view */}
      <Modal
        isOpen={!!viewingSchedule}
        onRequestClose={() => setViewingSchedule(null)}
        title="تفاصيل جدول التنظيف"
        size="lg"
      >
        {viewingSchedule && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الغرفة</p>
                <p className="text-lg font-semibold text-gray-900">{viewingSchedule.room?.roomNumber || '-'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">تاريخ الجدولة</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingSchedule.scheduledDate ? new Date(viewingSchedule.scheduledDate).toLocaleDateString('ar-SA') : '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الحالة</p>
                <p className="text-sm font-semibold text-primary">{statusToLabel(viewingSchedule.status)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
                <p className="text-sm text-gray-700">{viewingSchedule.notes || '-'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingSchedule(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CleaningSchedulesManagement;

