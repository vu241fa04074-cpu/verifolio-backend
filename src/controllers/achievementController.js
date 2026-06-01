const Achievement = require("../models/Achievement");


// CREATE ACHIEVEMENT
const createAchievement = async (req, res) => {
  try {

    const {
      title,
      description,
      category,
    } = req.body;

    const achievement = await Achievement.create({
      user: req.user._id,
      title,
      description,
      category,

      proofFile: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json(achievement);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET USER ACHIEVEMENTS
const getAchievements = async (req, res) => {
  try {

    const achievements =
      await Achievement.find({
        user: req.user._id,
      });

    res.json(achievements);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE ACHIEVEMENT
const updateAchievement = async (req, res) => {
  try {

    const achievement =
      await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        message: "Achievement not found",
      });
    }

    // OWNERSHIP CHECK
    if (
      achievement.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const {
      title,
      description,
      category,
    } = req.body;

    achievement.title =
      title || achievement.title;

    achievement.description =
      description || achievement.description;

    achievement.category =
      category || achievement.category;

    if (req.file) {
      achievement.proofFile = `/uploads/${req.file.filename}`;
    }

    await achievement.save();

    res.json(achievement);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE ACHIEVEMENT
const deleteAchievement = async (req, res) => {
  try {

    const achievement =
      await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        message: "Achievement not found",
      });
    }

    // OWNERSHIP CHECK
    if (
      achievement.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await achievement.deleteOne();

    res.json({
      message: "Achievement deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAchievement,
  getAchievements,
  updateAchievement,
  deleteAchievement,
};