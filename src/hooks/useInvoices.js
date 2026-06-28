// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import {
//   getInvoices,
//   addInvoice,
//   checkoutInvoice,
//   getInvoiceById,
// } from '../services/invoiceService.js';

// export const useInvoices = () => {
//   return useQuery({
//     queryKey: ['invoices'],
//     queryFn: getInvoices,
//     staleTime: 5 * 60 * 1000,
//   });
// };

// export const useInvoice = (invoiceId) => {
//   return useQuery({
//     queryKey: ['invoices', invoiceId],
//     queryFn: () => getInvoiceById(invoiceId),
//     enabled: !!invoiceId,
//     staleTime: 5 * 60 * 1000,
//   });
// };

// export const useAddInvoice = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: addInvoice,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['invoices'] });
//     },
//   });
// };

// export const useCheckoutInvoice = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: checkoutInvoice,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['invoices'] });
//       queryClient.invalidateQueries({ queryKey: ['bookings'] });
//       queryClient.invalidateQueries({ queryKey: ['rooms'] });
//     },
//   });
// };

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInvoices,
  addInvoice,
  checkoutInvoice,
  getInvoiceById,
  updateInvoice, // تأكد من إضافتها في ملف الخدمات
} from '../services/invoiceService.js';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvoice = (invoiceId) => {
  return useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCheckoutInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkoutInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};