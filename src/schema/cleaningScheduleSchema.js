import { z } from 'zod';

export const addCleaningScheduleSchema = z.object({
  room: z.string().min(1, 'الغرفة مطلوبة'),
  scheduledDate: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'تاريخ الجدولة مطلوب'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  notes: z.string().trim().optional(),
});

export const updateCleaningScheduleSchema = z.object({
  room: z.string().min(1).optional(),
  scheduledDate: z.coerce.date().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  notes: z.string().trim().optional(),
});

