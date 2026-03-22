import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { postAiChat } from '../../api/ai';
import { cn } from '../../utils/cn';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Assalam-o-alaikum! Main aapki sale / customer dhoondhne / pending payments mein madad kar sakta hun. Roman Urdu ya English likhein.',
    },
  ]);
  const listRef = useRef(null);
  const qc = useQueryClient();

  const chatMut = useMutation({
    mutationFn: postAiChat,
    onSuccess: (data) => {
      const text = data?.reply || '—';
      setMessages((m) => [...m, { role: 'assistant', content: text }]);
      if (data?.executed && (data?.action === 'create_sale' || data?.action === 'create_customer')) {
        qc.invalidateQueries({ queryKey: ['subscriptions'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
        qc.invalidateQueries({ queryKey: ['reports'] });
        qc.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Network error';
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${msg}` }]);
    },
  });

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text || chatMut.isPending) return;
    const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    chatMut.mutate({ message: text, history });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-20 right-4 z-[85] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-600/35 transition hover:scale-105 hover:shadow-xl md:bottom-8',
          open && 'pointer-events-none opacity-0'
        )}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-end p-4 pb-[4.5rem] sm:items-center sm:justify-center sm:p-6 sm:pb-6">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative flex max-h-[min(560px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-white/80 bg-white/95 shadow-2xl shadow-primary-900/20 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="AI assistant"
          >
            <header className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">AI Assistant</p>
                  <p className="text-[11px] text-white/85 truncate">Roman Urdu · English</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div
              ref={listRef}
              className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-3 py-4"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm',
                      msg.role === 'user'
                        ? 'rounded-br-md bg-primary-600 text-white'
                        : 'rounded-bl-md border border-slate-100 bg-secondary-50/90 text-slate-800'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatMut.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-3 py-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Soch raha hun…
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-slate-100 p-3">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Yahan likhein…"
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={chatMut.isPending || !input.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl bg-primary-600 text-white shadow-md transition hover:bg-primary-700 disabled:opacity-40"
                  aria-label="Send"
                >
                  {chatMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                AI galat samajh sakta hai — zaroori sales khud bhi check kar lein.
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
