import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCustomerSchema, updateCustomerSchema } from '../../schema/customerSchema.js';
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer } from '../../hooks/useCustomers.js';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { confirmDelete } from '../../lib/sweetalert.js';

const CustomersManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const { data: customers, isLoading } = useCustomers();
  const addCustomerMutation = useAddCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addCustomerSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateCustomerSchema),
  });

  const onAddSubmit = async (data) => {
    try {
      await addCustomerMutation.mutateAsync(data);
      toast.success('تم إضافة العميل بنجاح');
      setIsAddModalOpen(false);
      resetAdd();
    } catch (error) {
      toast.error(error.message || 'فشل في إضافة العميل');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined && value !== '')
      );

      if (Object.keys(payload).length === 0) {
        toast.error('يرجى تعديل حقل واحد على الأقل قبل الحفظ');
        return;
      }

      await updateCustomerMutation.mutateAsync({
        customerId: editingCustomer.id,
        data: payload,
      });
      toast.success('تم تحديث العميل بنجاح');
      setEditingCustomer(null);
      resetEdit();
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث العميل');
    }
  };

  const handleDelete = async (customerId) => {
    const isConfirmed = await confirmDelete(
      'هل أنت متأكد من حذف هذا العميل؟',
      'لن تتمكن من استعادة هذا العميل!'
    );

    if (!isConfirmed) return;

    try {
      await deleteCustomerMutation.mutateAsync(customerId);
      toast.success('تم حذف العميل بنجاح');
    } catch (error) {
      toast.error(error.message || 'فشل في حذف العميل');
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    resetEdit({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      idNumber: customer.idNumber,
    });
  };

  const customerIdAccessor = useMemo(
    () => (c) => c.id || c._id,
    []
  );

  const columns = [
    {
      header: 'الاسم',
      key: 'name',
    },
    {
      header: 'البريد الإلكتروني',
      key: 'email',
    },
    {
      header: 'رقم الهاتف',
      key: 'phone',
    },
    {
      header: 'رقم الهوية',
      key: 'idNumber',
    },
    {
      header: 'الإجراءات',
      render: (customer) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewingCustomer(customer)}
            title="عرض التفاصيل"
          >
            <FiEye size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(customer)}
          >
            <FiEdit2 size={16} />
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(customerIdAccessor(customer))}
            loading={deleteCustomerMutation.isPending}
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
          <h1 className="text-3xl font-semibold text-gray-900">إدارة العملاء</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            هنا يمكنك إضافة وتعديل وحذف عملاء الفندق بسهولة مع عرض تفاصيل العميل.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus size={20} className="ml-2" />
          إضافة عميل
        </Button>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">قائمة العملاء</h2>
            <p className="text-sm text-gray-500">يمكنك إدارة بيانات العملاء بسهولة.</p>
          </div>
        </div>

        <Table
          columns={columns}
          data={customers}
          loading={isLoading}
          emptyMessage="لا يوجد عملاء"
        />
      </div>

      {/* Modal لإضافة عميل */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
        }}
        title="إضافة عميل جديد"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input
              type="text"
              {...registerAdd('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.name && <p className="mt-1 text-sm text-red-600">{errorsAdd.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              {...registerAdd('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.email && <p className="mt-1 text-sm text-red-600">{errorsAdd.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="text"
              {...registerAdd('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.phone && <p className="mt-1 text-sm text-red-600">{errorsAdd.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
            <input
              type="text"
              {...registerAdd('idNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.idNumber && <p className="mt-1 text-sm text-red-600">{errorsAdd.idNumber.message}</p>}
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
            <Button type="submit" loading={addCustomerMutation.isPending}>
              إضافة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal لتحديث عميل */}
      <Modal
        isOpen={!!editingCustomer}
        onRequestClose={() => {
          setEditingCustomer(null);
          resetEdit();
        }}
        title="تحديث بيانات العميل"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input
              type="text"
              {...registerEdit('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.name && <p className="mt-1 text-sm text-red-600">{errorsEdit.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              {...registerEdit('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.email && <p className="mt-1 text-sm text-red-600">{errorsEdit.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="text"
              {...registerEdit('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.phone && <p className="mt-1 text-sm text-red-600">{errorsEdit.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
            <input
              type="text"
              {...registerEdit('idNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.idNumber && <p className="mt-1 text-sm text-red-600">{errorsEdit.idNumber.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingCustomer(null);
                resetEdit();
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={updateCustomerMutation.isPending}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal لعرض تفاصيل العميل */}
      <Modal
        isOpen={!!viewingCustomer}
        onRequestClose={() => setViewingCustomer(null)}
        title="تفاصيل العميل"
        size="lg"
      >
        {viewingCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الاسم</p>
                <p className="text-lg font-semibold text-gray-900">{viewingCustomer.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                <p className="text-lg font-semibold text-gray-900">{viewingCustomer.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                <p className="text-lg font-semibold text-gray-900">{viewingCustomer.phone}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">رقم الهوية</p>
                <p className="text-lg font-semibold text-gray-900">{viewingCustomer.idNumber}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">معرف العميل</p>
              <p className="text-sm font-mono text-gray-600 break-all">
                {viewingCustomer.id || viewingCustomer._id}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingCustomer(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersManagement;

