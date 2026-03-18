import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as remindersApi from '../api/reminders';

export const useReminders = (params) =>
  useQuery({
    queryKey: ['reminders', params],
    queryFn: () => remindersApi.fetchReminders(params),
  });

export const useCompleteReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersApi.completeReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
};

export const useDismissReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersApi.dismissReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
};
