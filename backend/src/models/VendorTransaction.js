const mongoose = require('mongoose');

const vendorTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['payment'], default: 'payment' },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

vendorTransactionSchema.index({ userId: 1, vendorId: 1, createdAt: -1 });

module.exports = mongoose.model('VendorTransaction', vendorTransactionSchema);
