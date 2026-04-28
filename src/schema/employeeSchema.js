import { z } from 'zod';

// Schema لإضافة موظف جديد
export const addEmployeeSchema = z.object({
  userName: z.string().min(2, 'اسم المستخدم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
});

// Schema لتحديث موظف
export const updateEmployeeSchema = z.object({
  userName: z.string().min(2, 'اسم المستخدم يجب أن يكون على الأقل حرفين').optional(),
//   email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف').optional(),
});

// Schema للموظف (الرد من الباك)
export const employeeSchema = z.object({
  id: z.string(),
  userName: z.string(),
  email: z.string(),
  role: z.literal('Employee'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schema لقائمة الموظفين
export const employeesListSchema = z.array(employeeSchema);