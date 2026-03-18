import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePayment } from '../api/payments';

export const useUpdatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, data }) => updatePayment(subscriptionId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['timeline', variables.subscriptionId] });
    },
  });
};
