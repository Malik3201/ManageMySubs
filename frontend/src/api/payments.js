import api from './axios';

export const updatePayment = (subscriptionId, data) =>
  api.patch(`/subscriptions/${subscriptionId}/payment`, data).then((r) => r.data.data);
