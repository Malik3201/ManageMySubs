import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as subsApi from '../api/subscriptions';

export const useSubscriptions = (params) =>
  useQuery({
    queryKey: ['subscriptions', params],
    queryFn: () => subsApi.fetchSubscriptions(params),
  });

export const useSubscription = (id) =>
  useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subsApi.fetchSubscription(id),
    enabled: !!id,
  });

export const useCreateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: subsApi.createSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};

export const useUpdateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subsApi.updateSubscription(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};

export const useToggleArchiveSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: subsApi.toggleArchiveSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subsApi.renewSubscription(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};
