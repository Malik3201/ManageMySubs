import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard';

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 60000,
  });
