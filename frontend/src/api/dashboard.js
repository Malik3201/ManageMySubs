import api from './axios';

export const fetchDashboard = () =>
  api.get('/dashboard').then((r) => r.data.data);
