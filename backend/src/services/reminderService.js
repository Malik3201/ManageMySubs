const Reminder = require('../models/Reminder');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/apiError');

const list = async (userId, query = {}) => {
  const filter = { userId };

  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;

  if (query.period === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    filter.dueDate = { $gte: start, $lte: end };
  } else if (query.period === 'upcoming') {
    filter.dueDate = { $gt: new Date() };
    filter.status = 'pending';
  } else if (query.period === 'overdue') {
    filter.dueDate = { $lt: new Date() };
    filter.status = 'pending';
  }

  return Reminder.find(filter)
    .populate({
      path: 'clientSubscriptionId',
      select: 'clientName clientPhone clientEmail categoryId sellingPrice currentEndDate paymentStatus',
      populate: { path: 'categoryId', select: 'name' },
    })
    .sort({ dueDate: 1 });
};

const markComplete = async (userId, id) => {
  const reminder = await Reminder.findOne({ _id: id, userId });
  if (!reminder) throw ApiError.notFound('Reminder not found');
  reminder.status = 'completed';
  reminder.completedAt = new Date();
  await reminder.save();

  await ActivityLog.create({
    userId,
    clientSubscriptionId: reminder.clientSubscriptionId,
    actionType: 'reminder_completed',
    meta: { reminderId: reminder._id, reminderType: reminder.type },
  });

  return reminder;
};

const dismiss = async (userId, id) => {
  const reminder = await Reminder.findOne({ _id: id, userId });
  if (!reminder) throw ApiError.notFound('Reminder not found');
  reminder.status = 'dismissed';
  await reminder.save();
  return reminder;
};

module.exports = { list, markComplete, dismiss };
