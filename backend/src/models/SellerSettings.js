const mongoose = require('mongoose');

const sellerSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true, default: 'Your Business' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerSettings', sellerSettingsSchema);

