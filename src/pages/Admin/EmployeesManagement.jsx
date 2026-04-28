import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addEmployeeSchema, updateEmployeeSchema } from '../../schema/employeeSchema.js';
import { useEmployees, useAddEmployee, useUpdateEmployee, useDeleteEmployee } from '../../hooks/useEmployees.js';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { confirmDelete } from '../../lib/sweetalert.js';

const EmployeesManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const { data: employees, isLoading } = useEmployees();
  const addEmployeeMutation = useAddEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addEmployeeSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateEmployeeSchema),
  });

  const onAddSubmit = async (data) => {
    try {
      await addEmployeeMutation.mutateAsync(data);
      toast.success('تم إضافة الموظف بنجاح');
      setIsAddModalOpen(false);
      resetAdd();
    } catch (error) {
      toast.error(error.message || 'فشل في إضافة الموظف');
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

      await updateEmployeeMutation.mutateAsync({
        employeeId: editingEmployee.id,
        data: payload,
      });
      toast.success('تم تحديث الموظف بنجاح');
      setEditingEmployee(null);
      resetEdit();
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث الموظف');
    }
  };

  const handleDelete = async (employeeId) => {
    const isConfirmed = await confirmDelete('هل أنت متأكد من حذف هذا الموظف؟', 'لن تتمكن من استعادة هذا الموظف!');
    if (isConfirmed) {
      try {
        await deleteEmployeeMutation.mutateAsync(employeeId);
        toast.success('تم حذف الموظف بنجاح');
      } catch (error) {
        toast.error(error.message || 'فشل في حذف الموظف');
      }
    }
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    resetEdit({
      userName: employee.userName,
      email: employee.email,
    });
  };

  const columns = [
    {
      header: 'الاسم',
      key: 'userName',
    },
    {
      header: 'البريد الإلكتروني',
      key: 'email',
    },
    {
      header: 'الدور',
      key: 'role',
    },
    {
      header: 'الإجراءات',
      render: (employee) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(employee)}
          >
            <FiEdit2 size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(employee.id)}
            loading={deleteEmployeeMutation.isPending}
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
          <h1 className="text-3xl font-semibold text-gray-900">إدارة الموظفين</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            هنا يمكنك إضافة وتعديل وحذف حسابات الموظفين بسهولة. هذا القسم مخصص لإدارة جميع موظفي الفندق بطريقة منظمة.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus size={20} className="ml-2" />
          إضافة موظف
        </Button>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">قائمة الموظفين</h2>
            <p className="text-sm text-gray-500">يمكنك البحث في القائمة وتعديل بيانات أي موظف بسهولة.</p>
          </div>
        </div>
        <Table
          columns={columns}
          data={employees}
          loading={isLoading}
          emptyMessage="لا يوجد موظفون"
        />
      </div>

      {/* Modal لإضافة موظف */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
        }}
        title="إضافة موظف جديد"
      >
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المستخدم
            </label>
            <input
              type="text"
              {...registerAdd('userName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.userName && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.userName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              {...registerAdd('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.email && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              {...registerAdd('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.password && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.password.message}</p>
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
            <Button
              type="submit"
              loading={addEmployeeMutation.isPending}
            >
              إضافة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal لتحديث موظف */}
      <Modal
        isOpen={!!editingEmployee}
        onRequestClose={() => {
          setEditingEmployee(null);
          resetEdit();
        }}
        title="تحديث الموظف"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المستخدم
            </label>
            <input
              type="text"
              {...registerEdit('userName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.userName && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.userName.message}</p>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور الجديدة (اختياري)
            </label>
            <input
              type="password"
              {...registerEdit('password')}
              placeholder="اتركها فارغة إذا لم تريد تغييرها"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.password && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.password.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingEmployee(null);
                resetEdit();
              }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              loading={updateEmployeeMutation.isPending}
            >
              تحديث
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesManagement;