const { z } = require('zod');

const createResellerSchema = z.object({
  name: z.string().min(1, 'Reseller name is required').max(120),
  phone: z.string().max(40).optional().default(''),
});

const upsertResellerPricingSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription is required'),
  sellingPrice: z.number().min(0, 'Selling price must be >= 0'),
});

const createResellerOrderSchema = z.object({
  resellerId: z.string().min(1, 'Reseller is required'),
  subscriptionId: z.string().min(1, 'Subscription is required'),
  clientEmail: z.string().email('Valid client email is required'),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional().default('pending'),
  amountReceived: z.number().min(0).optional(),
  paymentMethod: z.string().max(100).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
});

module.exports = {
  createResellerSchema,
  upsertResellerPricingSchema,
  createResellerOrderSchema,
};
