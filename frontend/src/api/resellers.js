import api from './axios';

export const fetchResellers = () =>
  api.get('/resellers').then((r) => r.data.data);

export const createReseller = (data) =>
  api.post('/resellers', data).then((r) => r.data.data);

export const fetchReseller = (id) =>
  api.get(`/resellers/${id}`).then((r) => r.data.data);

export const saveResellerPricing = (id, data) =>
  api.put(`/resellers/${id}/pricing`, data).then((r) => r.data.data);

export const fetchResellerPricingBySubscription = (resellerId, subscriptionId) =>
  api.get(`/resellers/${resellerId}/pricing/${subscriptionId}`).then((r) => r.data.data);

export const createResellerOrder = (data) =>
  api.post('/resellers/orders', data).then((r) => r.data.data);
