import { useQuery } from '@tanstack/react-query';
import { fetchSalesReport, fetchProfitReport } from '../api/reports';

export const useSalesReport = (params) =>
  useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => fetchSalesReport(params),
  });

export const useProfitReport = (params) =>
  useQuery({
    queryKey: ['reports', 'profit', params],
    queryFn: () => fetchProfitReport(params),
  });
