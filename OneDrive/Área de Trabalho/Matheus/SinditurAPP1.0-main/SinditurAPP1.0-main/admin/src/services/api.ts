import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email: string, password: string) => api.post('/admin/auth/login', { email, password })
}

export const staffAPI = {
  getAll: () => api.get('/admin/staff'),
  create: (data: any) => api.post('/admin/staff', data),
  update: (id: string, data: any) => api.put(`/admin/staff/${id}`, data),
  delete: (id: string) => api.delete(`/admin/staff/${id}`)
}

export const unitsAPI = {
  getAll: () => api.get('/units'),
  create: (data: any) => api.post('/admin/units', data),
  update: (id: string, data: any) => api.put(`/admin/units/${id}`, data),
  delete: (id: string) => api.delete(`/admin/units/${id}`)
}

export const servicesAPI = {
  getAll: () => api.get('/admin/services'),
  create: (data: any) => api.post('/admin/services', data),
  update: (id: string, data: any) => api.put(`/admin/services/${id}`, data),
  delete: (id: string) => api.delete(`/admin/services/${id}`)
}

export const doctorsAPI = {
  getAll: () => api.get('/admin/doctors'),
  create: (data: any) => api.post('/admin/doctors', data),
  update: (id: string, data: any) => api.put(`/admin/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/admin/doctors/${id}`)
}

export const appointmentsAPI = {
  getAll: (params?: any) => api.get('/admin/appointments', { params }),
  update: (id: string, data: any) => api.put(`/admin/appointments/${id}`, data)
}

export const financialAPI = {
  getSummary: (month?: number, year?: number, unit_id?: string) => 
    api.get('/admin/financial/summary', { params: { month, year, unit_id } }),
  getDaily: (date: string) => api.get('/admin/financial/daily', { params: { date } })
}

export const inventoryAPI = {
  getAll: () => api.get('/admin/inventory'),
  create: (data: any) => api.post('/admin/inventory', data),
  update: (id: string, data: any) => api.put(`/admin/inventory/${id}`, data),
  addMovement: (data: any) => api.post('/admin/inventory/movement', data),
  getMovements: (params?: any) => api.get('/admin/inventory/movements', { params })
}

export const patientsAPI = {
  getAll: () => api.get('/admin/patients'),
  getById: (id: string) => api.get(`/admin/patients/${id}`),
  update: (id: string, data: any) => api.put(`/admin/patients/${id}`, data)
}

export const documentsAPI = {
  getTemplates: () => api.get('/admin/document-templates'),
  updateTemplate: (type: string, content: string) => api.put(`/admin/document-templates/${type}`, { content }),
  generate: (data: any) => api.post('/admin/documents/generate', data),
  generatePDF: (data: any) => api.post('/admin/documents/generate-pdf', data)
}

export default api
