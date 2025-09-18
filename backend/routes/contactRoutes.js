const contactController = require('../controllers/contactController');
const express = require('express');

const router = express.Router();

router.post('/', contactController.postContact);
router.get('/', contactController.getContact);

module.exports = router;