export const currency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
};

export const statusColor = (status) => {
  const map = {
    active: 'bg-success-50 text-success-700',
    expiring_soon: 'bg-warning-50 text-warning-600',
    expired: 'bg-danger-50 text-danger-700',
    in_replacement: 'bg-primary-50 text-primary-700',
    replacement_completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-slate-100 text-slate-500',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export const paymentColor = (status) => {
  const map = {
    paid: 'bg-success-50 text-success-700',
    pending: 'bg-danger-50 text-danger-600',
    partially_paid: 'bg-warning-50 text-warning-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export const truncate = (str, len = 30) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};
