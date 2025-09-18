const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/loginAdmin", authController.loginAdmin);
router.get("/me", protect, authController.getMe);

module.exports = router;