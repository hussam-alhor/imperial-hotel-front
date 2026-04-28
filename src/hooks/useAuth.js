import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../services/authService.js';

// Hook لتسجيل الدخول باستخدام React Query
export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // حفظ التوكن في localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data)); // حفظ البيانات كـ JSON
      // يمكن إضافة منطق إضافي هنا، مثل إعادة توجيه
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};