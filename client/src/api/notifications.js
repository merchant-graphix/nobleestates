import api from './axios';

export const getNotifications = () =>
  api.get('/notifications').then(res => res.data);

export const markAllRead = () =>
  api.put('/notifications/read-all').then(res => res.data);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then(res => res.data);
