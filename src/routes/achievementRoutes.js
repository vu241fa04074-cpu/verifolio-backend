const express = require("express");

const {
  createAchievement,
  getAchievements,
  updateAchievement,
  deleteAchievement,
} = require("../controllers/achievementController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// CREATE
router.post(
  "/",
  protect,
  upload.single("proofFile"),
  createAchievement
);

// GET
router.get("/", protect, getAchievements);

// UPDATE
router.put(
  "/:id",
  protect,
  upload.single("proofFile"),
  updateAchievement
);

// DELETE
router.delete("/:id", protect, deleteAchievement);

module.exports = router;