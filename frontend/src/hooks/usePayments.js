import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePayment } from '../api/payments';
import { toast } from '../store/toastStore';

export const useUpdatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, data }) => updatePayment(subscriptionId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['timeline', variables.subscriptionId] });
      toast.success('Payment updated');
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Payment update failed'),
  });
};
