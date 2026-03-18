import api from './axios';

export const createReplacement = (subscriptionId, data) =>
  api.post(`/subscriptions/${subscriptionId}/replacements`, data).then((r) => r.data.data);

export const fetchReplacements = (subscriptionId) =>
  api.get(`/subscriptions/${subscriptionId}/replacements`).then((r) => r.data.data);
