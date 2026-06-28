import api from '../lib/api.js';

export const getAllCleaningSchedules = async () => {
  try {
    const response = await api.get('/cleaning-schedules');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addCleaningSchedule = async (cleaningScheduleData) => {
  try {
    const response = await api.post('/cleaning-schedules', cleaningScheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCleaningSchedule = async (cleaningScheduleId, cleaningScheduleData) => {
  try {
    const response = await api.put(`/cleaning-schedules/${cleaningScheduleId}`, cleaningScheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCleaningSchedule = async (cleaningScheduleId) => {
  try {
    const response = await api.delete(`/cleaning-schedules/${cleaningScheduleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

