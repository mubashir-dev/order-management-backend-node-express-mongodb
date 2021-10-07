const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/', AuthController.index);
router.get('/:id', AuthController.find);
router.put('/update', AuthController.update);
router.put('/changePassword', AuthController.changePassword);
router.put('/deactivate/:id', AuthController.deactivate);
router.put('/activate/:id', AuthController.activate);

module.exports = router
