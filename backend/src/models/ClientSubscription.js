const mongoose = require('mongoose');

const clientSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionCategory',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reseller',
      default: null,
    },
    isResellerSale: { type: Boolean, default: false },
    clientName: { type: String, trim: true, default: '' },
    clientPhone: { type: String, trim: true, default: '' },
    clientEmail: { type: String, trim: true, default: '' },
    purchaseDate: { type: Date, default: Date.now },
    startDate: { type: Date, required: true },
    originalEndDate: { type: Date, required: true },
    currentEndDate: { type: Date, required: true },
    sellingPrice: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    durationType: {
      type: String,
      enum: ['monthly', 'yearly', 'custom'],
      required: true,
    },
    customDays: { type: Number, default: 0 },
    totalDays: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'active',
        'expiring_soon',
        'expired',
        'in_replacement',
        'replacement_completed',
        'cancelled',
      ],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid'],
      default: 'pending',
    },
    paymentMethod: { type: String, trim: true, default: '' },
    amountReceived: { type: Number, default: 0 },
    amountRemaining: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    isArchived: { type: Boolean, default: false },
    renewalCount: { type: Number, default: 0 },
    parentSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientSubscription',
      default: null,
    },
  },
  { timestamps: true }
);

clientSubscriptionSchema.index({ userId: 1, status: 1 });
clientSubscriptionSchema.index({ userId: 1, currentEndDate: 1 });
clientSubscriptionSchema.index({ userId: 1, paymentStatus: 1 });
clientSubscriptionSchema.index({ userId: 1, vendorId: 1 });
clientSubscriptionSchema.index({ userId: 1, resellerId: 1, isResellerSale: 1 });
clientSubscriptionSchema.index(
  { clientName: 'text', clientEmail: 'text', clientPhone: 'text' }
);

module.exports = mongoose.model('ClientSubscription', clientSubscriptionSchema);
