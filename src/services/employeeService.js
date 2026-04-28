import api from '../lib/api.js';

// جلب جميع الموظفين
export const getEmployees = async () => {
  try {
    const response = await api.get('/users/employees');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// إضافة موظف جديد
export const addEmployee = async (employeeData) => {
  try {
    const response = await api.post('/users/employees', employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// تحديث موظف
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await api.put(`/users/employee/${employeeId}`, employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// حذف موظف
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await api.delete(`/users/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};