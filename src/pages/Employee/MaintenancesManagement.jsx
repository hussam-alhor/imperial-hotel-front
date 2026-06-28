import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  addMaintenanceSchema,
  updateMaintenanceSchema,
} from '../../schema/maintenanceSchema.js';

import {
  useMaintenances,
  useAddMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
} from '../../hooks/useMaintenances.js';

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
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return map[s] || s;
};

const MaintenancesManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [viewingMaintenance, setViewingMaintenance] = useState(null);

  const { data: maintenances = [], isLoading } = useMaintenances();
  const addMaintenanceMutation = useAddMaintenance();
  const updateMaintenanceMutation = useUpdateMaintenance();
  const deleteMaintenanceMutation = useDeleteMaintenance();

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addMaintenanceSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateMaintenanceSchema),
  });

  const roomsOptions = useMemo(() => rooms || [], [rooms]);

  // منطقيًا: الصيانة تبدأ على غرفة متاحة، وبعد حفظ الصيانة يتم تحويلها إلى "تحت الصيانة".
  const availableRoomsOptions = useMemo(
    () => roomsOptions.filter((r) => r.status === 'متاحة'),
    [roomsOptions]
  );

  const onAddSubmit = async (data) => {
    try {
      await addMaintenanceMutation.mutateAsync(data);
      toast.success('تم إضافة الصيانة بنجاح');
      setIsAddModalOpen(false);
      resetAdd();
    } catch (error) {
      toast.error(error.message || 'فشل في إضافة الصيانة');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      const maintenanceId = editingMaintenance?.id || editingMaintenance?._id;
      if (!maintenanceId) return;

      await updateMaintenanceMutation.mutateAsync({
        maintenanceId,
        data,
      });
      toast.success('تم تحديث الصيانة بنجاح');
      setEditingMaintenance(null);
      resetEdit();
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث الصيانة');
    }
  };

  const handleDelete = async (maintenanceId) => {
    const isConfirmed = await confirmDelete(
      'هل أنت متأكد من حذف الصيانة؟',
      'لن تتمكن من استعادة هذه الصيانة!'
    );
    if (!isConfirmed) return;

    try {
      await deleteMaintenanceMutation.mutateAsync(maintenanceId);
      toast.success('تم حذف الصيانة بنجاح');
    } catch (error) {
      toast.error(error.message || 'فشل في حذف الصيانة');
    }
  };

  const openEditModal = (m) => {
    setEditingMaintenance(m);
    resetEdit({
      room: m.room?._id || m.room,
      startDate: m.startDate ? new Date(m.startDate) : undefined,
      endDate: m.endDate ? new Date(m.endDate) : undefined,
      description: m.description,
      status: m.status,
    });
  };

  const columns = [
    {
      header: 'الغرفة',
      render: (m) => m.room?.roomNumber || '-'
    },
    {
      header: 'تاريخ البدء',
      render: (m) => (m.startDate ? new Date(m.startDate).toLocaleDateString('ar-SA') : '-')
    },
    {
      header: 'تاريخ الانتهاء',
      render: (m) => (m.endDate ? new Date(m.endDate).toLocaleDateString('ar-SA') : '-')
    },
    {
      header: 'الحالة',
      render: (m) => (
        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {statusToLabel(m.status)}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      render: (m) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewingMaintenance(m)}
          >
            <FiEye size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(m)}
          >
            <FiEdit2 size={16} />
          </Button>

          <Button
            variant="danger"
            size="sm"
            loading={deleteMaintenanceMutation.isPending}
            onClick={() => handleDelete(m.id || m._id)}
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
          <h1 className="text-3xl font-semibold text-gray-900">إدارة الصيانة</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            من هنا يمكنك إضافة وتعديل وحذف سجلات الصيانة.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus size={20} className="ml-2" />
          إضافة صيانة
        </Button>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <Table
          columns={columns}
          data={maintenances}
          loading={isLoading}
          emptyMessage="لا توجد صيانة"
        />
      </div>

      {/* Modal add */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
        }}
        title="إضافة صيانة جديدة"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
              <input
                type="date"
                {...registerAdd('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsAdd.startDate && (
                <p className="mt-1 text-sm text-red-600">{errorsAdd.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
              <input
                type="date"
                {...registerAdd('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsAdd.endDate && (
                <p className="mt-1 text-sm text-red-600">{errorsAdd.endDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              {...registerAdd('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.description && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              {...registerAdd('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="scheduled">scheduled</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
            </select>
            {errorsAdd.status && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.status.message}</p>
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
            <Button type="submit" loading={addMaintenanceMutation.isPending}>
              إضافة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal edit */}
      <Modal
        isOpen={!!editingMaintenance}
        onRequestClose={() => {
          setEditingMaintenance(null);
          resetEdit();
        }}
        title="تحديث الصيانة"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الغرفة</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
              <input
                type="date"
                {...registerEdit('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsEdit.startDate && (
                <p className="mt-1 text-sm text-red-600">{errorsEdit.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
              <input
                type="date"
                {...registerEdit('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errorsEdit.endDate && (
                <p className="mt-1 text-sm text-red-600">{errorsEdit.endDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              {...registerEdit('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.description && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              {...registerEdit('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">(اختياري)</option>
              <option value="scheduled">scheduled</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
            </select>
            {errorsEdit.status && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.status.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingMaintenance(null);
                resetEdit();
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={updateMaintenanceMutation.isPending}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal view */}
      <Modal
        isOpen={!!viewingMaintenance}
        onRequestClose={() => setViewingMaintenance(null)}
        title="تفاصيل الصيانة"
        size="lg"
      >
        {viewingMaintenance && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الغرفة</p>
                <p className="text-lg font-semibold text-gray-900">{viewingMaintenance.room?.roomNumber || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الحالة</p>
                <p className="text-lg font-semibold text-primary">{statusToLabel(viewingMaintenance.status)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">تاريخ البدء</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingMaintenance.startDate ? new Date(viewingMaintenance.startDate).toLocaleString('ar-SA') : '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingMaintenance.endDate ? new Date(viewingMaintenance.endDate).toLocaleString('ar-SA') : '-'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">الوصف</p>
              <p className="text-sm text-gray-700">{viewingMaintenance.description || '-'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingMaintenance(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenancesManagement;

