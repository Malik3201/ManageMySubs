const templates = {
  expiring_soon: (d) =>
    `Hi ${d.clientName || 'there'}, your ${d.categoryName} subscription is ending on ${d.endDate}. Renew now to avoid interruption.`,

  renewal_due: (d) =>
    `Hi ${d.clientName || 'there'}, your ${d.categoryName} subscription is expiring on ${d.endDate}. Please renew to continue the service. Thank you!`,

  expired: (d) =>
    `Hi ${d.clientName || 'there'}, your ${d.categoryName} subscription expired on ${d.endDate}. Would you like to renew? Let me know!`,

  payment_pending: (d) =>
    `Hi ${d.clientName || 'there'}, a friendly reminder that payment of ${d.amountRemaining || d.sellingPrice} is pending for your ${d.categoryName} subscription. Please complete the payment at your earliest convenience.`,

  replacement_issued: (d) =>
    `Hi ${d.clientName || 'there'}, a replacement has been issued for your ${d.categoryName} subscription. Your new end date is ${d.replacementEndDate}. Thank you for your patience!`,

  replacement_completed: (d) =>
    `Hi ${d.clientName || 'there'}, the replacement period for your ${d.categoryName} subscription has ended on ${d.replacementEndDate}. Please renew if you'd like to continue.`,

  followup: (d) =>
    `Hi ${d.clientName || 'there'}, just checking in about your ${d.categoryName} subscription. Please let me know if you need any assistance!`,
};

const generateMessage = (type, data) => {
  const fn = templates[type];
  if (!fn) return `Reminder about ${data.categoryName || 'your subscription'}`;
  return fn(data);
};

module.exports = { templates, generateMessage };
