const express = require("express");

const {
  createVerificationRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/verificationController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// CREATE
router.post(
  "/",
  protect,
  upload.single("proofFile"),
  createVerificationRequest
);

// USER REQUESTS
router.get(
  "/my-requests",
  protect,
  getMyRequests
);

// ADMIN GET ALL
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAllRequests
);

// APPROVE
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveRequest
);

// REJECT
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectRequest
);

module.exports = router;