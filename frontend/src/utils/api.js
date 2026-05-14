import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const studentAPI = {
  createProfile: (data) => api.post('/students/profile', data),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  addSubject: (data) => api.post('/students/subjects', data),
  getSubjects: (semester) => api.get(`/students/subjects/${semester}`),
  updateSubject: (id, data) => api.put(`/students/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/students/subjects/${id}`),
  getCGPA: () => api.get('/students/cgpa'),
  getSGPA: (semester) => api.get(`/students/sgpa/${semester}`),
  addAttendance: (data) => api.post('/students/attendance', data),
  getAttendance: () => api.get('/students/attendance'),
  deleteAttendance: (id) => api.delete(`/students/attendance/${id}`),
  addCertification: (data) => api.post('/students/certifications', data),
  getCertifications: () => api.get('/students/certifications'),
  updateCertification: (id, data) => api.put(`/students/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/students/certifications/${id}`),
}

export const smartAPI = {
  getSkills: () => api.get('/smart/skills'),
  addDreamJob: (data) => api.post('/smart/dream-jobs', data),
  getDreamJobs: () => api.get('/smart/dream-jobs'),
  getAnalytics: () => api.get('/smart/analytics'),
  getAvailableJobs: () => api.get('/smart/available-jobs'),
  getMinimumMarks: (id) => api.get(`/smart/minimum-marks/${id}`),
}

export const calendarAPI = {
  addEvent: (data) => api.post('/calendar/events', data),
  getEvents: () => api.get('/calendar/events'),
  getEventsByMonth: (year, month) => api.get(`/calendar/events/${year}/${month}`),
  getUpcomingExams: () => api.get('/calendar/upcoming-exams'),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
}

export const reportsAPI = {
  downloadPDF: () => api.get('/reports/pdf', { responseType: 'blob' }),
  downloadExcel: () => api.get('/reports/excel', { responseType: 'blob' }),
  downloadResume: () => api.get('/reports/resume-summary', { responseType: 'blob' }),
}

export default api