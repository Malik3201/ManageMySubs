const { Router } = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const replacementController = require('../controllers/replacementController');
const paymentController = require('../controllers/paymentController');
const timelineController = require('../controllers/timelineController');
const { validate } = require('../middlewares/validate');
const {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  renewSubscriptionSchema,
} = require('../validators/subscriptionValidator');
const { createReplacementSchema } = require('../validators/replacementValidator');
const { updatePaymentSchema } = require('../validators/paymentValidator');

const router = Router();

router.get('/', subscriptionController.list);
router.post('/', validate(createSubscriptionSchema), subscriptionController.create);
router.get('/:id', subscriptionController.getById);
router.post('/:id/receipt', subscriptionController.generateReceipt);
router.put('/:id', validate(updateSubscriptionSchema), subscriptionController.update);
router.patch('/:id/archive', subscriptionController.toggleArchive);
router.post('/:id/renew', validate(renewSubscriptionSchema), subscriptionController.renew);
router.patch('/:id/payment', validate(updatePaymentSchema), paymentController.updatePayment);
router.post('/:id/replacements', validate(createReplacementSchema), replacementController.create);
router.get('/:id/replacements', replacementController.listBySubscription);
router.get('/:id/timeline', timelineController.getBySubscription);

module.exports = router;
