const express = require("express");
const {
  getMyProfile,
  updateProfile,
  getPublicProfile,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.single("profileImage"), updateProfile);
router.get("/public/:username", getPublicProfile);

module.exports = router;
