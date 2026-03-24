import api from './axios';

export const fetchVendors = () => api.get('/vendors').then((r) => r.data.data);

export const fetchVendor = (id) => api.get(`/vendors/${id}`).then((r) => r.data.data);

export const createVendor = (data) => api.post('/vendors', data).then((r) => r.data.data);

export const addVendorPayment = (id, data) =>
  api.post(`/vendors/${id}/payments`, data).then((r) => r.data.data);

export const fetchVendorTransactions = (id) =>
  api.get(`/vendors/${id}/transactions`).then((r) => r.data.data);
