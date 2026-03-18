const reminderService = require('../services/reminderService');
const ApiResponse = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const reminders = await reminderService.list(req.userId, req.query);
    ApiResponse.success(res, reminders);
  } catch (err) {
    next(err);
  }
};

const markComplete = async (req, res, next) => {
  try {
    const reminder = await reminderService.markComplete(req.userId, req.params.id);
    ApiResponse.success(res, reminder, 'Reminder completed');
  } catch (err) {
    next(err);
  }
};

const dismiss = async (req, res, next) => {
  try {
    const reminder = await reminderService.dismiss(req.userId, req.params.id);
    ApiResponse.success(res, reminder, 'Reminder dismissed');
  } catch (err) {
    next(err);
  }
};

module.exports = { list, markComplete, dismiss };
