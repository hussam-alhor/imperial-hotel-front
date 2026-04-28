import { z } from 'zod';

// Schema لتسجيل الدخول
export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
});

// Schema للرد من الباك (افتراض بناءً على الرول)
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['Employee', 'Admin']),
  token: z.string(),
});