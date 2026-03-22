import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatShortDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd/MM/yyyy');
};

export const formatRelative = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const daysRemaining = (endDate) => {
  if (!endDate) return 0;
  return Math.max(0, differenceInDays(new Date(endDate), new Date()));
};

export const daysElapsed = (startDate) => {
  if (!startDate) return 0;
  return Math.max(0, differenceInDays(new Date(), new Date(startDate)));
};

export const toInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayStr = () => toInputDate(new Date());

/** Match backend subscription duration logic for UI previews */
export const getTotalDays = (durationType, customDays = 0) => {
  switch (durationType) {
    case 'monthly':
      return 30;
    case 'yearly':
      return 365;
    case 'custom':
      return Number(customDays) || 0;
    default:
      return 30;
  }
};

export const calculateEndDateFromPurchase = (purchaseDateStr, durationType, customDays) => {
  if (!purchaseDateStr) return null;
  const start = new Date(purchaseDateStr);
  if (Number.isNaN(start.getTime())) return null;
  const total = getTotalDays(durationType, customDays);
  if (durationType === 'custom' && total <= 0) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + total);
  return end;
};
