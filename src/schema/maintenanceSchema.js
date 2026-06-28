import { z } from 'zod';

export const addMaintenanceSchema = z.object({
  room: z.string().min(1, 'الغرفة مطلوبة'),
  startDate: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'تاريخ البدء مطلوب'),
  endDate: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'تاريخ الانتهاء مطلوب'),
  description: z.string().min(3, 'الوصف مطلوب'),
  status: z.enum(['scheduled', 'in_progress', 'completed']).default('scheduled'),
});

export const updateMaintenanceSchema = z.object({
  room: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  description: z.string().min(3).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed']).optional(),
});

