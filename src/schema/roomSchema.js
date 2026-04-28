import { z } from 'zod';


// Schema لإضافة غرفة جديدة
export const addRoomSchema = z.object({
  roomNumber: z.string().min(1, 'رقم الغرفة مطلوب'),
  type: z.enum(['فردية', 'مزدوجة', 'جناح', 'عائلية', 'أخرى'], { required_error: 'نوع الغرفة مطلوب' }),
  pricePerNight: z.coerce.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0'),
  status: z.enum(['متاحة', 'محجوز', 'تحت الصيانة']).default('متاحة'),
  category: z.enum(['اقتصادي', 'فاخر', 'رجال أعمال', 'جناح رئيسي'], { required_error: 'الفئة مطلوبة' }),
  amenities: z.array(z.string()).min(1, 'يجب اختيار خدمة واحدة على الأقل').optional(),
  images: z.array(z.string()).optional(), // مصفوفة من URLs للصور
});

// Schema لتحديث غرفة
export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1, 'رقم الغرفة مطلوب').optional(),
  type: z.enum(['فردية', 'مزدوجة', 'جناح', 'عائلية', 'أخرى']).optional(),
  pricePerNight: z.coerce.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0').optional(),
  status: z.enum(['متاحة', 'محجوز', 'تحت الصيانة']).optional(),
  category: z.enum(['اقتصادي', 'فاخر', 'رجال أعمال', 'جناح رئيسي']).optional(),
  amenities: z.array(z.string()).min(1, 'يجب اختيار خدمة واحدة على الأقل').optional(),
  images: z.array(z.string()).optional(),
});

// Schema للغرفة (الرد من الباك)
export const roomSchema = z.object({
  id: z.string(),
  roomNumber: z.string(),
  type: z.enum(['فردية', 'مزدوجة', 'جناح', 'عائلية', 'أخرى']),
  pricePerNight: z.number(),
  status: z.enum(['متاحة', 'محجوز', 'تحت الصيانة']),
  category: z.enum(['اقتصادي', 'فاخر', 'رجال أعمال', 'جناح رئيسي']),
  amenities: z.array(z.string()),
  images: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schema لقائمة الغرف
export const roomsListSchema = z.array(roomSchema);