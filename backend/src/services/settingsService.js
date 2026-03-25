const SellerSettings = require('../models/SellerSettings');

const getOrCreate = async (userId) => {
  const [row] = await SellerSettings.find({ userId }).limit(1).lean();
  if (row) return row;

  const created = await SellerSettings.create({
    userId,
    businessName: 'Your Business',
  });
  return created.toObject ? created.toObject() : created;
};

const update = async (userId, data) => {
  const businessName = String(data.businessName || '').trim();
  if (!businessName) throw new Error('businessName is required');

  const row = await SellerSettings.findOneAndUpdate(
    { userId },
    { $set: { businessName } },
    { new: true, upsert: true }
  ).lean();
  return row;
};

module.exports = { getOrCreate, update };

