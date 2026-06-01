const express = require("express");

const {
  createEndorsement,
  getUserEndorsements,
} = require("../controllers/endorsementController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE ENDORSEMENT
router.post("/", protect, createEndorsement);

// GET USER ENDORSEMENTS
router.get(
  "/:userId",
  getUserEndorsements
);

module.exports = router;