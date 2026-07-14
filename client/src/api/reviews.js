import api from './axios';

export const getPropertyReviews = (propertyId) =>
  api.get(`/reviews/property/${propertyId}`).then(res => res.data);

export const createReview = (data) =>
  api.post('/reviews', data).then(res => res.data);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`).then(res => res.data);
