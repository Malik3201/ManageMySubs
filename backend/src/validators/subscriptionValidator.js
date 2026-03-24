const { z } = require('zod');

const createSubscriptionSchema = z
  .object({
    categoryId: z.string().min(1, 'Category is required'),
    vendorId: z.string().optional(),
    vendorName: z.string().max(120).optional().default(''),
    clientName: z.string().max(200).optional().default(''),
    clientPhone: z.string().max(30).optional().default(''),
    clientEmail: z.string().email().optional().or(z.literal('')).default(''),
    purchaseDate: z.string().optional(),
    sellingPrice: z.number().min(0).optional().default(0),
    purchasePrice: z.number().min(0).optional().default(0),
    durationType: z.enum(['monthly', 'yearly', 'custom']),
    customDays: z.number().int().min(1).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional().default('pending'),
    paymentMethod: z.string().max(100).optional().default(''),
    amountReceived: z.number().min(0).optional().default(0),
    notes: z.string().max(2000).optional().default(''),
    tags: z.array(z.string().max(50)).max(20).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.durationType === 'custom' && !(data.customDays && data.customDays > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['customDays'],
        message: 'customDays required for custom duration',
      });
    }

    if (data.paymentStatus === 'partially_paid' && (data.amountReceived ?? 0) <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['amountReceived'],
        message: 'Amount received must be greater than 0 for partially paid subscriptions',
      });
    }
  });

const updateSubscriptionSchema = z.object({
  clientName: z.string().max(200).optional(),
  clientPhone: z.string().max(30).optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  vendorId: z.string().nullable().optional(),
  vendorName: z.string().max(120).optional(),
  sellingPrice: z.number().min(0).optional(),
  purchasePrice: z.number().min(0).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional(),
  paymentMethod: z.string().max(100).optional(),
  amountReceived: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['cancelled']).optional(),
}).superRefine((data, ctx) => {
  if (data.paymentStatus === 'partially_paid' && data.amountReceived !== undefined && data.amountReceived <= 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['amountReceived'],
      message: 'Amount received must be greater than 0 for partially paid subscriptions',
    });
  }
});

const renewSubscriptionSchema = z
  .object({
    purchaseDate: z.string().optional(),
    vendorId: z.string().optional(),
    vendorName: z.string().max(120).optional().default(''),
    sellingPrice: z.number().min(0).optional().default(0),
    purchasePrice: z.number().min(0).optional().default(0),
    durationType: z.enum(['monthly', 'yearly', 'custom']),
    customDays: z.number().int().min(1).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'partially_paid']).optional().default('pending'),
    paymentMethod: z.string().max(100).optional().default(''),
    amountReceived: z.number().min(0).optional().default(0),
    notes: z.string().max(2000).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.durationType === 'custom' && !(data.customDays && data.customDays > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['customDays'],
        message: 'customDays required for custom duration',
      });
    }

    if (data.paymentStatus === 'partially_paid' && (data.amountReceived ?? 0) <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['amountReceived'],
        message: 'Amount received must be greater than 0 for partially paid subscriptions',
      });
    }
  });

module.exports = { createSubscriptionSchema, updateSubscriptionSchema, renewSubscriptionSchema };
