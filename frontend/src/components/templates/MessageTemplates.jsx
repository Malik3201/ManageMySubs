import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const templateGenerators = {
  renewal_due: (d) =>
    `Hi ${d.clientName || 'there'}, your ${d.categoryName} subscription is expiring on ${d.endDate}. Please renew to continue the service. Thank you!`,
  expired: (d) =>
    `Hi ${d.clientName || 'there'}, your ${d.categoryName} subscription expired on ${d.endDate}. Would you like to renew? Let me know!`,
  payment_pending: (d) =>
    `Hi ${d.clientName || 'there'}, a friendly reminder that payment of ${d.amount || ''} is pending for your ${d.categoryName} subscription. Please pay at your earliest convenience.`,
  replacement_issued: (d) =>
    `Hi ${d.clientName || 'there'}, a replacement has been issued for your ${d.categoryName} subscription. Your new end date is ${d.newEndDate || ''}. Thank you!`,
  replacement_ended: (d) =>
    `Hi ${d.clientName || 'there'}, the replacement period for your ${d.categoryName} subscription has ended. Please renew to continue.`,
  followup: (d) =>
    `Hi ${d.clientName || 'there'}, just checking in about your ${d.categoryName} subscription. Let me know if you need anything!`,
};

export default function MessageTemplates({ data }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const templates = Object.entries(templateGenerators).map(([key, fn]) => ({
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    text: fn(data),
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Quick Message Templates</h3>
      {templates.map((t) => (
        <div key={t.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-primary-600">{t.label}</span>
            <button
              onClick={() => handleCopy(t.key, t.text)}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-white hover:text-slate-700 transition"
            >
              {copiedKey === t.key ? (
                <><Check className="h-3 w-3 text-success-500" /> Copied</>
              ) : (
                <><Copy className="h-3 w-3" /> Copy</>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-600">{t.text}</p>
        </div>
      ))}
    </div>
  );
}
