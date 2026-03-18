const getTotalDays = (durationType, customDays = 0) => {
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

const calculateEndDate = (startDate, totalDays) => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + totalDays);
  return end;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getElapsedDays = (startDate) => {
  const diff = Date.now() - new Date(startDate).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
};

const getRemainingDays = (endDate) => {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

const isExpiringSoon = (endDate, thresholdDays = 3) => {
  const remaining = getRemainingDays(endDate);
  return remaining > 0 && remaining <= thresholdDays;
};

const isExpired = (endDate) => new Date(endDate) < new Date();

const computeStatus = (subscription) => {
  if (subscription.status === 'cancelled') return 'cancelled';
  if (subscription.status === 'in_replacement') return 'in_replacement';
  if (subscription.status === 'replacement_completed') return 'replacement_completed';
  const end = subscription.currentEndDate;
  if (isExpired(end)) return 'expired';
  if (isExpiringSoon(end, 3)) return 'expiring_soon';
  return 'active';
};

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

module.exports = {
  getTotalDays,
  calculateEndDate,
  addDays,
  getElapsedDays,
  getRemainingDays,
  isExpiringSoon,
  isExpired,
  computeStatus,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
};
