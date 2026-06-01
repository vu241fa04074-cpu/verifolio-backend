const Project = require("../models/Project");


// CREATE PROJECT
const createProject = async (req, res) => {
  try {

    const {
      title,
      description,
      technologies,
      githubLink,
      liveLink,
    } = req.body;

    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      technologies,
      githubLink,
      liveLink,
    });

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL USER PROJECTS
const getProjects = async (req, res) => {
  try {

    const projects = await Project.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(projects);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // OWNERSHIP CHECK
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json(project);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // OWNERSHIP CHECK
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const {
      title,
      description,
      technologies,
      githubLink,
      liveLink,
    } = req.body;

    project.title = title || project.title;
    project.description =
      description || project.description;

    project.technologies =
      technologies || project.technologies;

    project.githubLink =
      githubLink || project.githubLink;

    project.liveLink =
      liveLink || project.liveLink;

    await project.save();

    res.json(project);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // OWNERSHIP CHECK
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await project.deleteOne();

    res.json({
      message: "Project deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};