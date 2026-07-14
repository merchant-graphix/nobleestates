import api from './axios';

export const getUsers = () => api.get('/admin/users').then(r => r.data);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role }).then(r => r.data);
export const getAdminInquiries = () => api.get('/admin/inquiries').then(r => r.data);
export const getAdminProperties = () => api.get('/admin/properties').then(r => r.data);
