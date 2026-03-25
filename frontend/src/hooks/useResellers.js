import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as resellersApi from '../api/resellers';
import { toast } from '../store/toastStore';

export const useResellers = () =>
  useQuery({
    queryKey: ['resellers'],
    queryFn: resellersApi.fetchResellers,
  });

export const useReseller = (id) =>
  useQuery({
    queryKey: ['resellers', id],
    queryFn: () => resellersApi.fetchReseller(id),
    enabled: !!id,
  });

export const useResellerPrice = (resellerId, subscriptionId) =>
  useQuery({
    queryKey: ['resellers', resellerId, 'pricing', subscriptionId],
    queryFn: () => resellersApi.fetchResellerPricingBySubscription(resellerId, subscriptionId),
    enabled: !!resellerId && !!subscriptionId,
    retry: false,
  });

export const useCreateReseller = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resellersApi.createReseller,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resellers'] });
      toast.success('Reseller created');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not create reseller');
    },
  });
};

export const useSaveResellerPricing = (resellerId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => resellersApi.saveResellerPricing(resellerId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['resellers', resellerId] });
      qc.invalidateQueries({ queryKey: ['resellers', resellerId, 'pricing', vars.subscriptionId] });
      toast.success('Pricing saved');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not save pricing');
    },
  });
};

export const useCreateResellerOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resellersApi.createResellerOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resellers'] });
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Reseller order created');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not create reseller order');
    },
  });
};
