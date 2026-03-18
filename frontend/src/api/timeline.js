import api from './axios';

export const fetchTimeline = (subscriptionId) =>
  api.get(`/subscriptions/${subscriptionId}/timeline`).then((r) => r.data.data);
