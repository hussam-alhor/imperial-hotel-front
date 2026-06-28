import api from '../lib/api.js';

export const getAllMaintenances = async () => {
  try {
    const response = await api.get('/maintenances');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addMaintenance = async (maintenanceData) => {
  try {
    const response = await api.post('/maintenances', maintenanceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateMaintenance = async (maintenanceId, maintenanceData) => {
  try {
    const response = await api.put(`/maintenances/${maintenanceId}`, maintenanceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMaintenance = async (maintenanceId) => {
  try {
    const response = await api.delete(`/maintenances/${maintenanceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMaintenanceById = async (maintenanceId) => {
  try {
    const response = await api.get(`/maintenances/${maintenanceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


