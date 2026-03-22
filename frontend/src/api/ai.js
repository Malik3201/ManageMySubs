import api from './axios';

/**
 * @param {{ message: string, history?: { role: string, content: string }[] }} body
 */
export const postAiChat = (body) => api.post('/ai/chat', body).then((r) => r.data.data);
