import api from './axios';

export const fetchCategories = (params) =>
  api.get('/categories', { params }).then((r) => r.data.data);

export const fetchCategory = (id) =>
  api.get(`/categories/${id}`).then((r) => r.data.data);

export const createCategory = (data) =>
  api.post('/categories', data).then((r) => r.data.data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then((r) => r.data.data);

export const toggleArchiveCategory = (id) =>
  api.patch(`/categories/${id}/archive`).then((r) => r.data.data);
