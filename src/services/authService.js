import api from '../lib/api.js';

// دالة تسجيل الدخول
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials); // تأكيد endpoint
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// دالة تسجيل الخروج (إذا كانت مطلوبة)
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout'); // افتراض endpoint
  } catch (error) {
    // تجاهل الأخطاء في تسجيل الخروج
  }
};