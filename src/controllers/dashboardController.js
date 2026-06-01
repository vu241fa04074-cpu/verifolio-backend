const Project = require("../models/Project");
const Certification = require("../models/Certification");
const Achievement = require("../models/Achievement");
const VerificationRequest = require("../models/VerificationRequest");
const ProfileAnalytics = require("../models/ProfileAnalytics");
const Endorsement = require("../models/Endorsement");
const Profile = require("../models/Profile");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalProjects,
      totalCertifications,
      totalAchievements,
      totalVerifications,
      pendingVerifications,
      endorsementsCount,
      profile,
    ] = await Promise.all([
      Project.countDocuments({ user: userId }),
      Certification.countDocuments({ user: userId }),
      Achievement.countDocuments({ user: userId }),
      VerificationRequest.countDocuments({ user: userId, status: "approved" }),
      VerificationRequest.countDocuments({ user: userId, status: "pending" }),
      Endorsement.countDocuments({ toUser: userId }),
      Profile.findOne({ user: userId }),
    ]);

    let analytics = await ProfileAnalytics.findOne({ user: userId });
    if (!analytics) {
      analytics = await ProfileAnalytics.create({ user: userId });
    }

    // Calculate profile completion
    let completion = 20; // base for having account
    if (profile) {
      if (profile.headline) completion += 10;
      if (profile.bio) completion += 10;
      if (profile.skills?.length > 0) completion += 15;
      if (profile.education?.length > 0) completion += 15;
      if (profile.workExperience?.length > 0) completion += 15;
      if (profile.socialLinks?.github) completion += 5;
      if (profile.socialLinks?.linkedin) completion += 5;
      if (profile.profileImage) completion += 5;
    }

    res.json({
      totalProjects,
      totalCertifications,
      totalAchievements,
      totalVerifications,
      pendingVerifications,
      endorsementsCount,
      profileCompletion: Math.min(completion, 100),
      profileViews: analytics.profileViews,
      analytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
