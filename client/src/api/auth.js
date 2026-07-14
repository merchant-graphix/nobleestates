import api from './axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(res => res.data);

export const register = (data) =>
  api.post('/auth/register', data).then(res => res.data);

export const getMe = () =>
  api.get('/auth/me').then(res => res.data);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then(res => res.data);

export const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password }).then(res => res.data);

export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword }).then(res => res.data);

export const updateProfile = (data) =>
  api.put('/auth/profile', data).then(res => res.data);

export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return api.post('/auth/avatar', fd).then(res => res.data);
};

export const sendVerification = () =>
  api.post('/auth/send-verification').then(res => res.data);

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email/${token}`).then(res => res.data);
