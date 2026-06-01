const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE PROJECT
router.post("/", protect, createProject);

// GET ALL PROJECTS
router.get("/", protect, getProjects);

// GET SINGLE PROJECT
router.get("/:id", protect, getProjectById);

// UPDATE PROJECT
router.put("/:id", protect, updateProject);

// DELETE PROJECT
router.delete("/:id", protect, deleteProject);

module.exports = router;