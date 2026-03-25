import api from './axios';

export const fetchSubscriptions = (params) =>
  api.get('/subscriptions', { params }).then((r) => r.data);

export const fetchSubscription = (id) =>
  api.get(`/subscriptions/${id}`).then((r) => r.data.data);

export const createSubscription = (data) =>
  api.post('/subscriptions', data).then((r) => r.data.data);

export const updateSubscription = (id, data) =>
  api.put(`/subscriptions/${id}`, data).then((r) => r.data.data);

export const toggleArchiveSubscription = (id) =>
  api.patch(`/subscriptions/${id}/archive`).then((r) => r.data.data);

export const renewSubscription = (id, data) =>
  api.post(`/subscriptions/${id}/renew`, data).then((r) => r.data.data);
