import { z } from 'zod';

export const addCustomerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100, 'الاسم طويل جدا'),
  email: z.string().email('بريد غير صالح'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  idNumber: z.string().min(1, 'رقم الهوية مطلوب'),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100, 'الاسم طويل جدا').optional(),
  email: z.string().email('بريد غير صالح').optional(),
  phone: z.string().min(1, 'رقم الهاتف مطلوب').optional(),
  idNumber: z.string().min(1, 'رقم الهوية مطلوب').optional(),
});

