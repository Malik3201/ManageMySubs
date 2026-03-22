/**
 * Longcat AI only — set LONGCAT_API_KEY, LONGCAT_API_URL, and AI_MODEL in .env
 */
const truthy = (v) => v === '1' || /^true$/i.test(String(v || ''));

const DEFAULT_LONGCAT_URL = 'https://api.longcat.chat/openai/v1/chat/completions';
const DEFAULT_MODEL = 'meituan/longcat-flash-chat';

module.exports = {
  enabled: truthy(process.env.AI_ENABLED) || !!process.env.LONGCAT_API_KEY,
  apiKey: process.env.LONGCAT_API_KEY || '',
  apiUrl: process.env.LONGCAT_API_URL || DEFAULT_LONGCAT_URL,
  model: process.env.AI_MODEL || DEFAULT_MODEL,
  /** If false, omit response_format (when the API rejects json_object mode). */
  jsonMode: !/^false$/i.test(process.env.AI_JSON_MODE || 'true'),
  timeoutMs: Math.min(120000, Math.max(5000, parseInt(process.env.AI_TIMEOUT_MS || '45000', 10) || 45000)),
};
