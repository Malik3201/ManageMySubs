const cron = require('node-cron');
const ClientSubscription = require('../models/ClientSubscription');
const Reminder = require('../models/Reminder');
const { generateMessage } = require('../utils/messageTemplates');
const { isExpired, computeStatus } = require('../utils/dateHelpers');

const resolveLifecycleStatus = (sub) => {
  if (sub.status === 'cancelled') return 'cancelled';
  if (sub.status === 'in_replacement' && isExpired(sub.currentEndDate)) {
    return 'replacement_completed';
  }
  if (sub.status === 'in_replacement') return 'in_replacement';
  if (sub.status === 'replacement_completed') return 'replacement_completed';
  return computeStatus(sub);
};

const buildReminderPayload = (sub) => ({
  clientName: sub.clientName,
  categoryName: sub.categoryId?.name || 'Subscription',
  endDate: sub.currentEndDate?.toISOString().split('T')[0],
  replacementEndDate: sub.currentEndDate?.toISOString().split('T')[0],
  sellingPrice: sub.sellingPrice,
  amountRemaining: sub.amountRemaining,
});

const processReminders = async () => {
  console.log('[Cron] Processing reminders...');

  try {
    const subs = await ClientSubscription.find({ isArchived: false })
      .populate('categoryId', 'name')
      .lean();

    for (const sub of subs) {
      const resolvedStatus = resolveLifecycleStatus(sub);
      const payload = buildReminderPayload(sub);

      if (resolvedStatus !== sub.status) {
        await ClientSubscription.updateOne({ _id: sub._id }, { status: resolvedStatus });
      }

      if (resolvedStatus === 'expiring_soon') {
        await upsertReminder(
          sub.userId,
          sub._id,
          'expiring_soon',
          sub.currentEndDate,
          generateMessage('expiring_soon', payload)
        );
      }

      if (resolvedStatus === 'expired') {
        await upsertReminder(
          sub.userId,
          sub._id,
          'expired',
          new Date(),
          generateMessage('expired', payload)
        );
        await upsertReminder(
          sub.userId,
          sub._id,
          'renewal_due',
          sub.currentEndDate,
          generateMessage('renewal_due', payload)
        );
      }

      if (resolvedStatus === 'replacement_completed') {
        await upsertReminder(
          sub.userId,
          sub._id,
          'replacement_completed',
          new Date(),
          generateMessage('replacement_completed', payload)
        );
      }

      if (['pending', 'partially_paid'].includes(sub.paymentStatus)) {
        await upsertReminder(
          sub.userId,
          sub._id,
          'payment_pending',
          new Date(),
          generateMessage('payment_pending', payload)
        );
      }
    }

    console.log('[Cron] Reminders processed successfully');
  } catch (err) {
    console.error('[Cron] Error processing reminders:', err);
  }
};

const upsertReminder = async (userId, subId, type, dueDate, message) => {
  const existing = await Reminder.findOne({
    userId,
    clientSubscriptionId: subId,
    type,
    status: 'pending',
  });

  if (existing) {
    existing.dueDate = dueDate;
    existing.messageTemplate = message;
    await existing.save();
    return;
  }

  await Reminder.create({
    userId,
    clientSubscriptionId: subId,
    type,
    dueDate,
    messageTemplate: message,
  });
};

const startReminderCron = () => {
  // Run frequently enough for operators, while keeping logic idempotent.
  cron.schedule('0 */6 * * *', processReminders);
  console.log('[Cron] Reminder job scheduled (every 6 hours)');

  setTimeout(processReminders, 5000);
};

module.exports = { startReminderCron, processReminders };
