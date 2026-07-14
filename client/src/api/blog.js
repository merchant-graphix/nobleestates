import api from './axios';

export const getBlogPosts = (params) =>
  api.get('/blog', { params }).then(res => res.data);

export const getBlogPost = (slug) =>
  api.get(`/blog/${slug}`).then(res => res.data);

export const createBlogPost = (data) =>
  api.post('/blog', data).then(res => res.data);

export const updateBlogPost = (id, data) =>
  api.put(`/blog/${id}`, data).then(res => res.data);

export const deleteBlogPost = (id) =>
  api.delete(`/blog/${id}`).then(res => res.data);
