const { Router } = require('express');
const reportController = require('../controllers/reportController');

const router = Router();

router.get('/sales', reportController.getSalesReport);
router.get('/profit', reportController.getProfitReport);

module.exports = router;
