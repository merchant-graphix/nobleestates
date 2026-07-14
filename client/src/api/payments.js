import api from './axios';

export const makePayment = (data) =>
  api.post('/payments', data).then(r => r.data);

export const getMyPayments = () =>
  api.get('/payments/my').then(r => r.data);

export const getAllPayments = () =>
  api.get('/payments/all').then(r => r.data);
