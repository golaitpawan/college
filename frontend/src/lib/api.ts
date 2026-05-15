import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)));
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        queue.forEach((fn) => fn());
        queue = [];
        return api(original);
      } catch {
        queue = [];
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Departments
export const departmentsApi = {
  list: (collegeId?: string) => api.get('/departments', { params: { collegeId } }),
  get: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: string, data: any) => api.patch(`/departments/${id}`, data),
};

// Courses
export const coursesApi = {
  list: (departmentId?: string) => api.get('/courses', { params: { departmentId } }),
  get: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
};

// Subjects
export const subjectsApi = {
  list: (courseId?: string) => api.get('/subjects', { params: { courseId } }),
  get: (id: string) => api.get(`/subjects/${id}`),
  create: (data: any) => api.post('/subjects', data),
};

// Classrooms
export const classroomsApi = {
  list: (collegeId?: string) => api.get('/classrooms', { params: { collegeId } }),
  create: (data: any) => api.post('/classrooms', data),
};

// Sections
export const sectionsApi = {
  list: (courseId?: string, sessionId?: string) => api.get('/sections', { params: { courseId, sessionId } }),
  get: (id: string) => api.get(`/sections/${id}`),
  create: (data: any) => api.post('/sections', data),
};

// Academic sessions
export const sessionsApi = {
  list: (collegeId?: string) => api.get('/academic-sessions', { params: { collegeId } }),
  create: (data: any) => api.post('/academic-sessions', data),
};

// Users
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  assignRole: (id: string, data: any) => api.post(`/users/${id}/roles`, data),
  updateStatus: (id: string, status: string) => api.patch(`/users/${id}/status`, { status }),
};

// Timetables
export const timetableApi = {
  list: (params?: any) => api.get('/timetables', { params }),
  get: (id: string) => api.get(`/timetables/${id}`),
  forStudent: () => api.get('/timetables/student'),
  forTeacher: () => api.get('/timetables/teacher'),
  create: (data: any) => api.post('/timetables', data),
  addEntry: (id: string, data: any) => api.post(`/timetables/${id}/entries`, data),
  removeEntry: (id: string, entryId: string) => api.delete(`/timetables/${id}/entries/${entryId}`),
  validate: (id: string) => api.post(`/timetables/${id}/validate`),
  submit: (id: string) => api.post(`/timetables/${id}/submit`),
  approve: (id: string, comment?: string) => api.post(`/timetables/${id}/approve`, { comment }),
  requestChanges: (id: string, comment: string) => api.post(`/timetables/${id}/request-changes`, { comment }),
  publish: (id: string) => api.post(`/timetables/${id}/publish`),
};

// Notifications
export const notificationsApi = {
  list: (unread?: boolean) => api.get('/notifications', { params: { unread } }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};
