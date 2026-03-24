const { z } = require('zod');

const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(120),
});

const vendorPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  note: z.string().max(500).optional().default(''),
});

module.exports = {
  createVendorSchema,
  vendorPaymentSchema,
};
