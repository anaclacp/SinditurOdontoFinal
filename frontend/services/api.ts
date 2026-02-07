import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: {
    name: string;
    cpf: string;
    birth_date: string;
  }) => api.post('/auth/register', data),
  
  login: (data: { cpf: string; birth_date: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
};

// Units API
export const unitsAPI = {
  getAll: () => api.get('/units'),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
};

// Doctors API
export const doctorsAPI = {
  getAll: (unitId?: string) =>
    api.get('/doctors', { params: unitId ? { unit_id: unitId } : {} }),
  getById: (id: string) => api.get(`/doctors/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  create: (data: {
    unit_id: string;
    service_id: string;
    doctor_id: string;
    date: string;
    time: string;
    notes?: string;
  }) => api.post('/appointments', data),
  
  getAll: () => api.get('/appointments'),
  
  cancel: (id: string) => api.delete(`/appointments/${id}`),
};

export default api;
