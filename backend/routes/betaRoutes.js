const betaController = require("../controllers/betaController");
const express = require('express');

const router = express.Router();

router.post('/', betaController.postEmail);

module.exports = router