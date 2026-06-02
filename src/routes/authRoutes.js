const express = require("express");
const validate = require("../middleware/validationMiddleware");

const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidator");

const {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", registerValidation, validate, registerUser);

// LOGIN
router.post("/login", loginValidation, validate, loginUser);

// GOOGLE AUTH (no validation needed - Google handles security)
router.post("/google", googleAuth);

// CURRENT USER
router.get("/me", protect, getMe);

module.exports = router;
