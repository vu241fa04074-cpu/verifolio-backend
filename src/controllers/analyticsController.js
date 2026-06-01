const ProfileAnalytics = require("../models/ProfileAnalytics");

// GET MY ANALYTICS
const getMyAnalytics = async (req, res) => {
  try {
    let analytics = await ProfileAnalytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = await ProfileAnalytics.create({ user: req.user._id });
    }
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyAnalytics };
