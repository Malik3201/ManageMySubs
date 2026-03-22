import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as remindersApi from '../api/reminders';
import { toast } from '../store/toastStore';

export const useReminders = (params) =>
  useQuery({
    queryKey: ['reminders', params],
    queryFn: () => remindersApi.fetchReminders(params),
  });

export const useCompleteReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersApi.completeReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Reminder completed');
    },
    onError: () => toast.error('Could not complete reminder'),
  });
};

export const useDismissReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersApi.dismissReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder dismissed');
    },
    onError: () => toast.error('Could not dismiss'),
  });
};
