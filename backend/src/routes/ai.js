const { Router } = require('express');
const auth = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { aiChatBodySchema } = require('../validators/aiValidators');
const aiController = require('../controllers/aiController');

const router = Router();

router.post('/chat', auth, validate(aiChatBodySchema), aiController.chat);

module.exports = router;
