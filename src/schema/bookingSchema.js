import { z } from 'zod';

export const addBookingSchema = z.object({
  customer: z.string().min(1, 'العميل مطلوب'),
  room: z.string().min(1, 'الغرفة مطلوبة'),

  checkInDate: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'تاريخ الدخول مطلوب'),
  checkOutDate: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'تاريخ الخروج مطلوب'),

  nights: z.coerce.number().int().min(1, 'عدد الليالي يجب أن يكون على الأقل 1'),
  initialPayment: z.coerce.number().min(0, 'الدفع المبدئي يجب أن يكون >= 0'),

  specialRequests: z.union([z.array(z.string().trim()), z.string().trim()]).optional(),
  status: z.enum(['active', 'cancelled', 'completed']).optional(),
});

export const updateBookingSchema = z.object({
  customer: z.string().min(1).optional(),
  room: z.string().min(1).optional(),

  checkInDate: z.coerce.date().optional(),
  checkOutDate: z.coerce.date().optional(),

  nights: z.coerce.number().int().min(1).optional(),
  initialPayment: z.coerce.number().min(0).optional(),

  specialRequests: z.union([z.array(z.string().trim()), z.string().trim()]).optional(),
  status: z.enum(['active', 'cancelled', 'completed']).optional(),
});

