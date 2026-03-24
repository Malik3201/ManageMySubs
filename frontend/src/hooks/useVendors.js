import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as vendorsApi from '../api/vendors';
import { toast } from '../store/toastStore';

export const useVendors = () =>
  useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsApi.fetchVendors,
  });

export const useVendor = (id) =>
  useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorsApi.fetchVendor(id),
    enabled: !!id,
  });

export const useVendorTransactions = (id) =>
  useQuery({
    queryKey: ['vendors', id, 'transactions'],
    queryFn: () => vendorsApi.fetchVendorTransactions(id),
    enabled: !!id,
  });

export const useCreateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vendorsApi.createVendor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not create vendor');
    },
  });
};

export const useAddVendorPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, data }) => vendorsApi.addVendorPayment(vendorId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      qc.invalidateQueries({ queryKey: ['vendors', vars.vendorId] });
      qc.invalidateQueries({ queryKey: ['vendors', vars.vendorId, 'transactions'] });
      toast.success('Vendor payment added');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Could not add payment');
    },
  });
};
