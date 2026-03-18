const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
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
    actionType: {
      type: String,
      enum: [
        'created',
        'renewed',
        'replacement_issued',
        'payment_updated',
        'expired',
        'cancelled',
        'archived',
        'restored',
        'updated',
        'reminder_completed',
      ],
      required: true,
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ clientSubscriptionId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
