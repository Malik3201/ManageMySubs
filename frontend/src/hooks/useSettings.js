import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '../store/toastStore';
import * as settingsApi from '../api/settings';

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.fetchSettings,
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not save settings');
    },
  });
};

