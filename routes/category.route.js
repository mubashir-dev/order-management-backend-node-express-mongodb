const express = require('express');
const router = express.Router();
const ProductCategoryController = require('../controllers/ProductCategoryController')

router.post('/add',ProductCategoryController.create);
router.get('/', ProductCategoryController.index);
router.get('/:id', ProductCategoryController.find);
router.put('/edit/:id',ProductCategoryController.update);
router.delete('/:id', ProductCategoryController.delete);
router.get('/deactivate/:id', ProductCategoryController.deactivate);
router.get('/activate/:id', ProductCategoryController.activate);
module.exports = router
