import { create } from 'zustand';

let idSeq = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],
  dismiss: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
  push: (message, type = 'success', duration = 4000) => {
    const id = ++idSeq;
    set((s) => ({
      toasts: [...s.toasts, { id, message, type }],
    }));
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
}));

export const toast = {
  success: (message, duration) => useToastStore.getState().push(message, 'success', duration),
  error: (message, duration) => useToastStore.getState().push(message, 'error', duration),
  info: (message, duration) => useToastStore.getState().push(message, 'info', duration),
};
