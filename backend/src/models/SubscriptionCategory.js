const mongoose = require('mongoose');

const subscriptionCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    defaultPurchasePrice: { type: Number, default: 0 },
    description: { type: String, trim: true, default: '' },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subscriptionCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SubscriptionCategory', subscriptionCategorySchema);
