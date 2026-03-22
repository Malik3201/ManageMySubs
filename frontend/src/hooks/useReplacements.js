import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as replacementsApi from '../api/replacements';
import { toast } from '../store/toastStore';

export const useReplacements = (subscriptionId) =>
  useQuery({
    queryKey: ['replacements', subscriptionId],
    queryFn: () => replacementsApi.fetchReplacements(subscriptionId),
    enabled: !!subscriptionId,
  });

export const useCreateReplacement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, data }) =>
      replacementsApi.createReplacement(subscriptionId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['replacements'] });
      qc.invalidateQueries({ queryKey: ['timeline', variables.subscriptionId] });
      toast.success('Replacement recorded');
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Replacement failed'),
  });
};
