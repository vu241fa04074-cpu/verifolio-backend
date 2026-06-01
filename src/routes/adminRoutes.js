const express = require("express");
const { getAdminStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);

module.exports = router;
