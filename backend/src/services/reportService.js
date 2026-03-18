const ClientSubscription = require('../models/ClientSubscription');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('../utils/dateHelpers');

const getSalesReport = async (userId, query = {}) => {
  const { from, to, groupBy = 'daily' } = query;
  const start = from ? new Date(from) : startOfMonth();
  const end = to ? new Date(to) : endOfMonth();

  const subs = await ClientSubscription.find({
    userId,
    purchaseDate: { $gte: start, $lte: end },
    isArchived: false,
  })
    .populate('categoryId', 'name')
    .sort({ purchaseDate: 1 })
    .lean();

  if (groupBy === 'daily') {
    const map = {};
    subs.forEach((s) => {
      const key = new Date(s.purchaseDate).toISOString().split('T')[0];
      if (!map[key]) map[key] = { date: key, sales: 0, profit: 0, count: 0 };
      map[key].sales += s.sellingPrice || 0;
      map[key].profit += (s.sellingPrice || 0) - (s.purchasePrice || 0);
      map[key].count += 1;
    });
    return { rows: Object.values(map), total: subs.length };
  }

  const map = {};
  subs.forEach((s) => {
    const d = new Date(s.purchaseDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = { month: key, sales: 0, profit: 0, count: 0 };
    map[key].sales += s.sellingPrice || 0;
    map[key].profit += (s.sellingPrice || 0) - (s.purchasePrice || 0);
    map[key].count += 1;
  });
  return { rows: Object.values(map), total: subs.length };
};

const getProfitReport = async (userId, query = {}) => {
  const { from, to } = query;
  const start = from ? new Date(from) : startOfMonth();
  const end = to ? new Date(to) : endOfMonth();

  const subs = await ClientSubscription.find({
    userId,
    purchaseDate: { $gte: start, $lte: end },
    isArchived: false,
  })
    .populate('categoryId', 'name')
    .lean();

  const byCategory = {};
  let totalSales = 0;
  let totalProfit = 0;

  subs.forEach((s) => {
    const catName = s.categoryId?.name || 'Unknown';
    if (!byCategory[catName]) byCategory[catName] = { category: catName, sales: 0, profit: 0, count: 0 };
    const sale = s.sellingPrice || 0;
    const profit = sale - (s.purchasePrice || 0);
    byCategory[catName].sales += sale;
    byCategory[catName].profit += profit;
    byCategory[catName].count += 1;
    totalSales += sale;
    totalProfit += profit;
  });

  return {
    byCategory: Object.values(byCategory),
    totalSales,
    totalProfit,
    totalCount: subs.length,
  };
};

module.exports = { getSalesReport, getProfitReport };
