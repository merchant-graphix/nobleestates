import api from './axios';

export const submitInquiry = (data) =>
  api.post('/inquiries', data).then(res => res.data);
