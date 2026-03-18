const mongoose = require('mongoose');

const replacementSchema = new mongoose.Schema(
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
      index: true,
    },
    reason: { type: String, trim: true, default: '' },
    issueDate: { type: Date, default: Date.now },
    usedDaysBeforeDeactivation: { type: Number, required: true },
    replacementDaysGranted: { type: Number, required: true },
    replacementType: {
      type: String,
      enum: ['partial_paid', 'full_replacement_only'],
      required: true,
    },
    paidExtraDays: { type: Number, default: 0 },
    replacementStartDate: { type: Date, required: true },
    replacementEndDate: { type: Date, required: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Replacement', replacementSchema);
