import api from './axios';

export const getProperties = (params) =>
  api.get('/properties', { params }).then(res => res.data);

export const getProperty = (id) =>
  api.get(`/properties/${id}`).then(res => res.data);

export const getBatchProperties = (ids) =>
  api.get('/properties/batch', { params: { ids: ids.join(',') } }).then(res => res.data);

export const getPropertyStats = () =>
  api.get('/properties/stats').then(res => res.data);

export const createProperty = (data) =>
  api.post('/properties', data).then(res => res.data);

export const updateProperty = (id, data) =>
  api.put(`/properties/${id}`, data).then(res => res.data);

export const deleteProperty = (id) =>
  api.delete(`/properties/${id}`).then(res => res.data);

export const uploadImages = (id, files) => {
  const fd = new FormData();
  files.forEach(f => fd.append('images', f));
  return api.post(`/properties/${id}/images`, fd).then(res => res.data);
};

export const deleteImage = (imageId) =>
  api.delete(`/properties/images/${imageId}`).then(res => res.data);

export const getCities = () =>
  api.get('/cities').then(res => res.data);
