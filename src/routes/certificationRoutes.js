const express = require("express");

const {
  createCertification,
  getCertifications,
  updateCertification,
  deleteCertification,
} = require("../controllers/certificationController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// CREATE
router.post(
  "/",
  protect,
  upload.single("certificateFile"),
  createCertification
);

// GET
router.get("/", protect, getCertifications);

// UPDATE
router.put(
  "/:id",
  protect,
  upload.single("certificateFile"),
  updateCertification
);

// DELETE
router.delete("/:id", protect, deleteCertification);

module.exports = router;