const aiConfig = require('../config/ai');

/**
 * Calls an OpenAI-compatible Chat Completions API.
 * @param {{ system: string, messages: { role: string, content: string }[] }} param0
 * @returns {Promise<string>} assistant text (expect JSON)
 */
async function chatCompletion({ system, messages }) {
  if (!aiConfig.apiKey) {
    const err = new Error('LONGCAT_API_KEY_NOT_CONFIGURED');
    err.code = 'LONGCAT_API_KEY_NOT_CONFIGURED';
    throw err;
  }

  const body = {
    model: aiConfig.model,
    messages: [{ role: 'system', content: system }, ...messages],
    temperature: 0.15,
    max_tokens: 1200,
  };

  if (aiConfig.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

  try {
    const res = await fetch(aiConfig.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await res.text();
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error(`AI non-JSON response (${res.status}): ${raw.slice(0, 200)}`);
    }

    if (!res.ok) {
      const msg = json?.error?.message || json?.message || raw.slice(0, 300);
      const err = new Error(msg || `AI HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }

    const text = json?.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
      throw new Error('AI returned empty content');
    }
    return text.trim();
  } finally {
    clearTimeout(t);
  }
}

module.exports = { chatCompletion };
