const ApiResponse = require('../utils/apiResponse');
const aiChatService = require('../services/aiChatService');

exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.validatedBody;
    const data = await aiChatService.runChat(req.userId, { message, history });
    return ApiResponse.success(res, data, 'OK');
  } catch (err) {
    next(err);
  }
};
