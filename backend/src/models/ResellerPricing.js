const mongoose = require('mongoose');

const resellerPricingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reseller',
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionCategory',
      required: true,
    },
    sellingPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

resellerPricingSchema.index({ userId: 1, resellerId: 1, subscriptionId: 1 }, { unique: true });

module.exports = mongoose.model('ResellerPricing', resellerPricingSchema);
