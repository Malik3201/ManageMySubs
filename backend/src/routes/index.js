const { Router } = require('express');
const auth = require('../middlewares/auth');

const router = Router();

router.use('/auth', require('./auth'));
router.use('/categories', auth, require('./categories'));
router.use('/subscriptions', auth, require('./subscriptions'));
router.use('/reminders', auth, require('./reminders'));
router.use('/dashboard', auth, require('./dashboard'));
router.use('/reports', auth, require('./reports'));

module.exports = router;
