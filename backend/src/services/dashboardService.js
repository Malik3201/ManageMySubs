const ClientSubscription = require('../models/ClientSubscription');
const Reminder = require('../models/Reminder');
const Replacement = require('../models/Replacement');
const {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
} = require('../utils/dateHelpers');

// Realized profit depends on payment status.
// - pending => 0
// - paid => full profit
// - partially_paid => profit scaled by amountReceived / sellingPrice
const realizedProfit = (s) => {
  const sale = s.sellingPrice || 0;
  const purchase = s.purchasePrice || 0;
  const profit = sale - purchase;

  if (s.paymentStatus === 'pending') return 0;
  if (s.paymentStatus === 'paid') return profit;

  if (s.paymentStatus === 'partially_paid') {
    const ratio = sale > 0 ? (s.amountReceived || 0) / sale : 0;
    return profit * ratio;
  }

  return profit;
};

const getSummary = async (userId) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const threeDaysFromNow = addDays(now, 3);

  const base = { userId, isArchived: false };
  const lifecycleExclusions = { $nin: ['cancelled', 'in_replacement', 'replacement_completed'] };

  const [
    activeCount,
    expiringSoonCount,
    expiredCount,
    remindersDue,
    todaySubs,
    monthlySubs,
    replacementsActive,
    paymentPending,
    paidCount,
    renewalsThisMonth,
  ] = await Promise.all([
    ClientSubscription.countDocuments({
      ...base,
      status: lifecycleExclusions,
      currentEndDate: { $gt: threeDaysFromNow },
    }),
    ClientSubscription.countDocuments({
      ...base,
      currentEndDate: { $gte: now, $lte: threeDaysFromNow },
      status: lifecycleExclusions,
    }),
    ClientSubscription.countDocuments({
      ...base,
      status: lifecycleExclusions,
      currentEndDate: { $lt: now },
    }),
    Reminder.countDocuments({ userId, status: 'pending', dueDate: { $lte: todayEnd } }),
    ClientSubscription.find({ ...base, purchaseDate: { $gte: todayStart, $lte: todayEnd } }).lean(),
    ClientSubscription.find({ ...base, purchaseDate: { $gte: monthStart, $lte: monthEnd } }).lean(),
    Replacement.countDocuments({ userId, replacementEndDate: { $gte: now } }),
    ClientSubscription.countDocuments({ ...base, paymentStatus: { $in: ['pending', 'partially_paid'] } }),
    ClientSubscription.countDocuments({ ...base, paymentStatus: 'paid' }),
    ClientSubscription.countDocuments({
      ...base,
      parentSubscriptionId: { $ne: null },
      purchaseDate: { $gte: monthStart, $lte: monthEnd },
    }),
  ]);

  const todaySales = todaySubs.reduce((sum, s) => sum + (s.sellingPrice || 0), 0);
  const todayProfit = todaySubs.reduce((sum, s) => sum + realizedProfit(s), 0);
  const monthlySales = monthlySubs.reduce((sum, s) => sum + (s.sellingPrice || 0), 0);
  const monthlyProfit = monthlySubs.reduce((sum, s) => sum + realizedProfit(s), 0);

  return {
    activeCount,
    expiringSoonCount,
    expiredCount,
    remindersDue,
    todaySales,
    todayProfit,
    monthlySales,
    monthlyProfit,
    replacementsActive,
    paymentPending,
    paidCount,
    renewalsThisMonth,
  };
};

module.exports = { getSummary };
