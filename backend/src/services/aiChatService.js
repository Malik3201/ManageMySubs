const { z } = require('zod');
const aiConfig = require('../config/ai');
const { buildSystemPrompt } = require('../utils/aiPrompt');
const { parseAiJson } = require('../utils/aiJsonParse');
const { chatCompletion } = require('./llmClient');
const { buildSellerContext } = require('./aiContextService');
const { executeAction } = require('./aiExecutionService');

const AiEnvelopeSchema = z.object({
  action: z.enum([
    'create_sale',
    'create_customer',
    'find_customer',
    'get_customer_history',
    'list_pending_payments',
    'none',
  ]),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  assistantMessage: z.string().max(12000).optional(),
});

const MAX_HISTORY = 12;
const MAX_MSG_LEN = 2000;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, MAX_MSG_LEN),
    }));
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ message: string, history?: {role:string,content:string}[] }} input
 */
async function runChat(userId, input) {
  const message = String(input.message || '').trim().slice(0, MAX_MSG_LEN);
  if (!message) {
    return {
      reply: 'Kuch likhein — masalan sale ki detail ya "pending payments".',
      action: 'none',
      executed: false,
      meta: { error: 'EMPTY_MESSAGE' },
    };
  }

  if (!aiConfig.apiKey) {
    return {
      reply:
        'AI assistant configure nahi hai. Backend .env mein LONGCAT_API_KEY, LONGCAT_API_URL aur AI_MODEL set karein.',
      action: 'none',
      executed: false,
      meta: { error: 'LONGCAT_API_KEY_NOT_CONFIGURED' },
    };
  }

  let contextStr;
  try {
    contextStr = await buildSellerContext(userId);
  } catch {
    contextStr = '{"categories":[],"recentCustomers":[]}';
  }

  const system = buildSystemPrompt(contextStr);
  const history = sanitizeHistory(input.history);
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  let rawText;
  try {
    rawText = await chatCompletion({ system, messages });
  } catch (e) {
    const code = e.code || e.message;
    return {
      reply:
        code === 'AI_API_KEY_NOT_CONFIGURED' || code === 'LONGCAT_API_KEY_NOT_CONFIGURED'
          ? 'LONGCAT_API_KEY missing hai — .env check karein.'
          : `AI service masla: ${e.message || 'unknown'}. Thori dair baad try karein.`,
      action: 'none',
      executed: false,
      meta: { error: String(e.message || e) },
    };
  }

  const parsedObj = parseAiJson(rawText);
  if (!parsedObj) {
    return {
      reply:
        'Jawab samajh nahi aaya. Dobara chhota sa message bhejein — ya sale format: naam, service, price, duration, number.',
      action: 'none',
      executed: false,
      meta: { error: 'JSON_PARSE', rawPreview: String(rawText).slice(0, 200) },
    };
  }

  const validated = AiEnvelopeSchema.safeParse(parsedObj);
  if (!validated.success) {
    return {
      reply: 'System ne AI jawab validate nahi kiya. Dobara likhein.',
      action: 'none',
      executed: false,
      meta: { error: 'SCHEMA', issues: validated.error?.issues },
    };
  }

  const { action, data, assistantMessage } = validated.data;

  if (action === 'none') {
    return {
      reply: assistantMessage || 'Theek hai.',
      action: 'none',
      executed: false,
      meta: {},
    };
  }

  try {
    const result = await executeAction(userId, action, data);
    if (result.skipExecution) {
      return {
        reply: assistantMessage || 'Theek hai.',
        action,
        executed: false,
        meta: {},
      };
    }
    const reply = [assistantMessage, result.message].filter(Boolean).join('\n\n').trim();
    return {
      reply: reply || result.message || 'Ho gaya.',
      action,
      executed: !!result.executed,
      subscriptionId: result.subscriptionId,
      meta: { backendMessage: result.message },
    };
  } catch (e) {
    return {
      reply: `${assistantMessage ? `${assistantMessage}\n\n` : ''}Error: ${e.message || 'save failed'}`,
      action,
      executed: false,
      meta: { error: String(e.message || e) },
    };
  }
}

module.exports = { runChat };
