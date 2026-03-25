const { Router } = require('express');
const resellerController = require('../controllers/resellerController');
const { validate } = require('../middlewares/validate');
const {
  createResellerSchema,
  upsertResellerPricingSchema,
  createResellerOrderSchema,
} = require('../validators/resellerValidator');

const router = Router();

router.get('/', resellerController.list);
router.post('/', validate(createResellerSchema), resellerController.create);
router.post('/orders', validate(createResellerOrderSchema), resellerController.createOrder);
router.get('/:id', resellerController.getById);
router.get('/:id/pricing', resellerController.listPricing);
router.put('/:id/pricing', validate(upsertResellerPricingSchema), resellerController.upsertPricing);
router.get('/:id/pricing/:subscriptionId', resellerController.pricingForSubscription);

module.exports = router;
