export const DURATION_TYPES = [
  { value: 'monthly', label: 'Monthly (30 days)' },
  { value: 'yearly', label: 'Yearly (365 days)' },
  { value: 'custom', label: 'Custom' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'partially_paid', label: 'Partially Paid' },
];

export const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'in_replacement', label: 'In Replacement' },
  { value: 'replacement_completed', label: 'Replacement Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const REMINDER_TYPES = [
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'renewal_due', label: 'Renewal Due' },
  { value: 'replacement_completed', label: 'Replacement Completed' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'followup', label: 'Follow Up' },
];

export const REPLACEMENT_TYPES = [
  { value: 'partial_paid', label: 'Partial Paid' },
  { value: 'full_replacement_only', label: 'Full Replacement Only' },
];

export const TAG_OPTIONS = ['VIP', 'trusted', 'late payer', 'follow-up', 'urgent'];
