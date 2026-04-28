import Swal from 'sweetalert2';

export const swal = Swal.mixin({
  customClass: {
    confirmButton: 'bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors mr-2',
    cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors',
    title: 'text-gray-900 text-xl font-semibold',
    htmlContainer: 'text-gray-600 text-sm',
    popup: 'rounded-2xl shadow-xl border border-gray-100',
    icon: 'text-red-500',
    actions: 'gap-2',
  },
  buttonsStyling: false,
  reverseButtons: true,
  confirmButtonText: 'تأكيد',
  cancelButtonText: 'إلغاء',
  showCancelButton: true,
  focusCancel: true,
});

// دالة مساعدة لتأكيد الحذف
export const confirmDelete = async (title = 'هل أنت متأكد؟', text = 'لن تتمكن من استعادة هذا العنصر!') => {
  const result = await swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'نعم، احذف',
    cancelButtonText: 'إلغاء',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors mr-2',
  });
  return result.isConfirmed;
};

// دالة مساعدة لعرض نجاح
export const showSuccess = (title = 'تم بنجاح!', text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    customClass: {
      confirmButton: 'bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors',
      title: 'text-gray-900 text-xl font-semibold',
      htmlContainer: 'text-gray-600 text-sm',
      popup: 'rounded-2xl shadow-xl border border-gray-100',
    },
    buttonsStyling: false,
    confirmButtonText: 'حسناً',
    showCancelButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

// دالة مساعدة لعرض خطأ
export const showError = (title = 'حدث خطأ!', text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    customClass: {
      confirmButton: 'bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors',
      title: 'text-gray-900 text-xl font-semibold',
      htmlContainer: 'text-gray-600 text-sm',
      popup: 'rounded-2xl shadow-xl border border-gray-100',
    },
    buttonsStyling: false,
    confirmButtonText: 'حسناً',
    showCancelButton: false,
  });
};

