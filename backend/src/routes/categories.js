const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const { validate } = require('../middlewares/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidator');

const router = Router();

router.get('/', categoryController.list);
router.post('/', validate(createCategorySchema), categoryController.create);
router.get('/:id', categoryController.getById);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.patch('/:id/archive', categoryController.toggleArchive);

module.exports = router;
