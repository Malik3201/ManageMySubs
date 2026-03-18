const { z } = require('zod');

const updatePaymentSchema = z
  .object({
    paymentStatus: z.enum(['pending', 'paid', 'partially_paid']),
    paymentMethod: z.string().max(100).optional(),
    amountReceived: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentStatus === 'partially_paid' && (data.amountReceived ?? 0) <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['amountReceived'],
        message: 'Amount received must be greater than 0 for partially paid subscriptions',
      });
    }
  });

module.exports = { updatePaymentSchema };
