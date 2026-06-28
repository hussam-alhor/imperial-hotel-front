import api from '../lib/api.js';

export const getInvoices = async () => {
  try {
    const response = await api.get('/invoices');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const checkoutInvoice = async (invoiceId) => {
  try {
    const response = await api.post(`/invoices/${invoiceId}/checkout`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateInvoice = async ({ id, data }) => {
  try {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

