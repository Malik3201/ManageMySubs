const { Router } = require('express');
const { validate } = require('../middlewares/validate');
const settingsController = require('../controllers/settingsController');
const { z } = require('zod');

const router = Router();

const updateSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(120),
});

router.get('/', settingsController.get);
router.put('/', validate(updateSettingsSchema), settingsController.update);

module.exports = router;

