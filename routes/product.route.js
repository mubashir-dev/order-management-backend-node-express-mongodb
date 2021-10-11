const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController')
const {UserUpload, ProductUpload} = require('../config/storage');

router.post('/add', ProductUpload.single('image'), ProductController.create);
router.put('/edit/:id', ProductUpload.single('image'), ProductController.update);
router.get('/', ProductController.index);
router.get('/:id', ProductController.find);
router.put('/edit/:id', ProductController.update);
router.delete('/:id', ProductController.delete);
router.get('/deactivate/:id', ProductController.deactivate);
router.get('/activate/:id', ProductController.activate);
module.exports = router
