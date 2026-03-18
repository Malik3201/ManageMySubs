const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  defaultPurchasePrice: z.number().min(0).optional().default(0),
  description: z.string().max(500).optional().default(''),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  defaultPurchasePrice: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
