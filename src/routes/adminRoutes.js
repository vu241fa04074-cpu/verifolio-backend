const express = require("express");
const {
  getAdminStats,
  getAllUsers,
  getUserById,
  getAllVerifications,
  approveVerification,
  rejectVerification,
  getPendingEndorsements,
  validateEndorsement,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorizeRoles("admin"));

// STATS
router.get("/stats", getAdminStats);

// USER MANAGEMENT
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);

// VERIFICATION MANAGEMENT
router.get("/verifications", getAllVerifications);
router.put("/verifications/:id/approve", approveVerification);
router.put("/verifications/:id/reject", rejectVerification);

// ENDORSEMENT VALIDATION
router.get("/endorsements", getPendingEndorsements);
router.put("/endorsements/:id/validate", validateEndorsement);

module.exports = router;

