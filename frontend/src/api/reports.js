import api from './axios';

export const fetchSalesReport = (params) =>
  api.get('/reports/sales', { params }).then((r) => r.data.data);

export const fetchProfitReport = (params) =>
  api.get('/reports/profit', { params }).then((r) => r.data.data);
