import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as subsApi from '../api/subscriptions';
import { toast } from '../store/toastStore';

const invalidateSubsAndDash = (qc) => {
  qc.invalidateQueries({ queryKey: ['subscriptions'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['reports'] });
};

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
    onSuccess: () => {
      invalidateSubsAndDash(qc);
      toast.success('Subscription created');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not create subscription');
    },
  });
};

export const useUpdateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subsApi.updateSubscription(id, data),
    onSuccess: () => {
      invalidateSubsAndDash(qc);
      toast.success('Saved');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Update failed');
    },
  });
};

export const useToggleArchiveSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: subsApi.toggleArchiveSubscription,
    onSuccess: () => {
      invalidateSubsAndDash(qc);
      toast.success('Updated');
    },
    onError: () => toast.error('Could not update archive state'),
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subsApi.renewSubscription(id, data),
    onSuccess: () => {
      invalidateSubsAndDash(qc);
      toast.success('Renewal complete');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Renewal failed');
    },
  });
};
