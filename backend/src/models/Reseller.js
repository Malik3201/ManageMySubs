const mongoose = require('mongoose');

const resellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

resellerSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Reseller', resellerSchema);
