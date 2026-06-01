const User = require("../models/User");
const Project = require("../models/Project");
const Certification = require("../models/Certification");
const Achievement = require("../models/Achievement");
const VerificationRequest = require("../models/VerificationRequest");

// ADMIN STATS
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalCertifications,
      totalAchievements,
      totalVerificationRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Certification.countDocuments(),
      Achievement.countDocuments(),
      VerificationRequest.countDocuments(),
      VerificationRequest.countDocuments({ status: "pending" }),
      VerificationRequest.countDocuments({ status: "approved" }),
      VerificationRequest.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalCertifications,
      totalAchievements,
      totalVerificationRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats };
