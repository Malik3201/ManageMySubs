const { z } = require('zod');

const createReplacementSchema = z
  .object({
    reason: z.string().max(500).optional().default(''),
    usedDaysBeforeDeactivation: z.number().int().min(0),
    replacementType: z.enum(['partial_paid', 'full_replacement_only']),
    paidExtraDays: z.number().int().min(0).optional().default(0),
    notes: z.string().max(2000).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.replacementType === 'partial_paid' && data.paidExtraDays < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['paidExtraDays'],
        message: 'Paid extra days must be at least 1 for partial paid replacements',
      });
    }
  });

module.exports = { createReplacementSchema };
