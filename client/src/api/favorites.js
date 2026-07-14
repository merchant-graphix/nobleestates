import api from './axios';

export const getFavorites = () =>
  api.get('/favorites').then(res => res.data);

export const toggleFavorite = (propertyId) =>
  api.post(`/favorites/${propertyId}`).then(res => res.data);
