import api from '../lib/api.js';

// جلب جميع الغرف
export const getRooms = async () => {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// إضافة غرفة جديدة
export const addRoom = async (roomData) => {
  try {
    const response = await api.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// تحديث غرفة
export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// حذف غرفة
export const deleteRoom = async (roomId) => {
  try {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// جلب غرفة واحدة بالـ ID
export const getRoomById = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};