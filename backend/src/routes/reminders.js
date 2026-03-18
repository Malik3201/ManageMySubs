const { Router } = require('express');
const reminderController = require('../controllers/reminderController');

const router = Router();

router.get('/', reminderController.list);
router.patch('/:id/complete', reminderController.markComplete);
router.patch('/:id/dismiss', reminderController.dismiss);

module.exports = router;
