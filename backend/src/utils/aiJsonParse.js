/**
 * Extract JSON object from model output (handles occasional markdown fences).
 */
function parseAiJson(text) {
  if (!text || typeof text !== 'string') return null;
  let s = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(s);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

module.exports = { parseAiJson };
