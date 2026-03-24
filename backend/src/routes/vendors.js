const { Router } = require('express');
const vendorController = require('../controllers/vendorController');
const { validate } = require('../middlewares/validate');
const { createVendorSchema, vendorPaymentSchema } = require('../validators/vendorValidator');

const router = Router();

router.get('/', vendorController.list);
router.post('/', validate(createVendorSchema), vendorController.create);
router.get('/:id', vendorController.getById);
router.post('/:id/payments', validate(vendorPaymentSchema), vendorController.addPayment);
router.get('/:id/transactions', vendorController.transactions);

module.exports = router;
