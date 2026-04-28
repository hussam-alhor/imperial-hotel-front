import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/employeeService.js';

// Hook لجلب الموظفين
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
};

// Hook لإضافة موظف
export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

// Hook لتحديث موظف
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }) => updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

// Hook لحذف موظف
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};