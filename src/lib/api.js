import axios from 'axios';

// إنشاء instance من axios مع base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor لإضافة التوكن في كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // افتراض أن التوكن محفوظ في localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع الأخطاء (مثل انتهاء التوكن)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا كان التوكن غير صالح، قم بتسجيل الخروج
      localStorage.removeItem('token');
      window.location.href = '/login'; // إعادة توجيه لصفحة تسجيل الدخول
    }
    return Promise.reject(error);
  }
);

export default api;