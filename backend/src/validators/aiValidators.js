const { z } = require('zod');

const aiChatBodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      })
    )
    .max(24)
    .optional()
    .default([]),
});

module.exports = { aiChatBodySchema };
