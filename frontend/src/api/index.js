import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  verifyEmail: (data) => api.post('/auth/verify-email/', data),
  login: (data) => api.post('/auth/login/', data),
  googleLogin: (credential) => api.post('/auth/google/', { credential }),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.post('/auth/change-password/', data),
  deactivate: () => api.post('/auth/deactivate/'),
};

export const propertyAPI = {
  list: (params) => api.get('/properties/listings/', { params }),
  get: (id) => api.get(`/properties/listings/${id}/`),
  create: (data) => api.post('/properties/listings/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.patch(`/properties/listings/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/properties/listings/${id}/`),
  myProperties: () => api.get('/properties/listings/my_properties/'),
  featured: () => api.get('/properties/listings/featured/'),
  nearby: (params) => api.get('/properties/listings/nearby/', { params }),
  toggleFavorite: (id) => api.post(`/properties/${id}/favorite/`),
  getFavorites: () => api.get('/properties/favorites/'),
  addImages: (id, data) => api.post(`/properties/listings/${id}/add_images/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (imgId) => api.delete(`/properties/images/${imgId}/delete/`),
  uploadImage: (file, folder = 'property_hub/properties') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return api.post('/properties/upload/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const inquiryAPI = {
  create: (data) => api.post('/inquiries/', data),
  getSent: () => api.get('/inquiries/sent/'),
  getReceived: () => api.get('/inquiries/received/'),
  respond: (id, response) => api.post(`/inquiries/${id}/respond/`, { response }),
};

export const chatAPI = {
  getRooms: () => api.get('/chat/rooms/'),
  getOrCreateRoom: (property_id) => api.post('/chat/rooms/create/', { property_id }),
  getMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages/`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications/'),
  markAllRead: () => api.post('/notifications/mark-read/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
};

export const adminAPI = {
  getStats: () => api.get('/admin-panel/stats/'),
  getUsers: () => api.get('/admin-panel/users/'),
  updateUser: (id, data) => api.patch(`/admin-panel/users/${id}/`, data),
  getProperties: (params) => api.get('/properties/admin/', { params }),
  approveProperty: (id) => api.post(`/properties/admin/${id}/approve/`),
  rejectProperty: (id) => api.post(`/properties/admin/${id}/reject/`),
};
