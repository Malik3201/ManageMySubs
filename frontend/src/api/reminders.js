import api from './axios';

export const fetchReminders = (params) =>
  api.get('/reminders', { params }).then((r) => r.data.data);

export const completeReminder = (id) =>
  api.patch(`/reminders/${id}/complete`).then((r) => r.data.data);

export const dismissReminder = (id) =>
  api.patch(`/reminders/${id}/dismiss`).then((r) => r.data.data);
