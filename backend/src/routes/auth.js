const { Router } = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
