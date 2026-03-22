import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoriesApi from '../api/categories';
import { toast } from '../store/toastStore';

export const useCategories = (params) =>
  useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.fetchCategories(params),
  });

export const useCategory = (id) =>
  useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.fetchCategory(id),
    enabled: !!id,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Could not create category'),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Update failed'),
  });
};

export const useToggleArchiveCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.toggleArchiveCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
    },
    onError: () => toast.error('Could not update category'),
  });
};
