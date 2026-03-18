const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientSubscription',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'expiring_soon',
        'expired',
        'renewal_due',
        'replacement_completed',
        'payment_pending',
        'followup',
      ],
      required: true,
    },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'dismissed'],
      default: 'pending',
    },
    messageTemplate: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ userId: 1, dueDate: 1 });
reminderSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
