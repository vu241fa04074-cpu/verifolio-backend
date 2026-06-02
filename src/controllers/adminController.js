const User = require("../models/User");
const Project = require("../models/Project");
const Certification = require("../models/Certification");
const Achievement = require("../models/Achievement");
const VerificationRequest = require("../models/VerificationRequest");
const Endorsement = require("../models/Endorsement");
const asyncHandler = require("express-async-handler");

// GET ADMIN STATS (optimized with lean() for better performance)
const getAdminStats = asyncHandler(async (req, res) => {
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
});

// GET ALL USERS (pagination support for large datasets)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, verified } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (verified !== undefined) filter.isVerified = verified === "true";

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .limit(Number(limit))
      .skip(skip)
      .lean()
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    },
  });
});

// GET USER BY ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-password").lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// GET ALL VERIFICATION REQUESTS (admin review)
const getAllVerifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;

  const [requests, total] = await Promise.all([
    VerificationRequest.find(filter)
      .populate("userId", "name email username")
      .limit(Number(limit))
      .skip(skip)
      .lean()
      .sort({ createdAt: -1 }),
    VerificationRequest.countDocuments(filter),
  ]);

  res.json({
    requests,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    },
  });
});

// APPROVE VERIFICATION REQUEST
const approveVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const verification = await VerificationRequest.findById(id);

  if (!verification) {
    res.status(404);
    throw new Error("Verification request not found");
  }

  verification.status = "approved";
  verification.adminRemarks = remarks || "";
  await verification.save();

  res.json({
    message: "Verification approved",
    verification,
  });
});

// REJECT VERIFICATION REQUEST
const rejectVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!remarks || remarks.trim().length === 0) {
    res.status(400);
    throw new Error("Remarks are required for rejection");
  }

  const verification = await VerificationRequest.findById(id);

  if (!verification) {
    res.status(404);
    throw new Error("Verification request not found");
  }

  verification.status = "rejected";
  verification.adminRemarks = remarks;
  await verification.save();

  res.json({
    message: "Verification rejected",
    verification,
  });
});

// GET PENDING ENDORSEMENTS (admin validation)
const getPendingEndorsements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [endorsements, total] = await Promise.all([
    Endorsement.find({ status: "pending" })
      .populate("fromUser", "name email username profileImage")
      .populate("toUser", "name email username profileImage")
      .limit(Number(limit))
      .skip(skip)
      .lean()
      .sort({ createdAt: 1 }),
    Endorsement.countDocuments({ status: "pending" }),
  ]);

  res.json({
    endorsements,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    },
  });
});

// VALIDATE ENDORSEMENT (approve/reject)
const validateEndorsement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, remarks } = req.body; // action: "approve" or "reject"

  if (!["approve", "reject"].includes(action)) {
    res.status(400);
    throw new Error("Invalid action. Use 'approve' or 'reject'");
  }

  if (action === "reject" && (!remarks || remarks.trim().length === 0)) {
    res.status(400);
    throw new Error("Remarks required for rejection");
  }

  const endorsement = await Endorsement.findById(id);

  if (!endorsement) {
    res.status(404);
    throw new Error("Endorsement not found");
  }

  endorsement.status = action === "approve" ? "approved" : "rejected";
  endorsement.adminValidation = {
    validatedBy: req.user._id,
    validatedAt: new Date(),
    remarks: remarks || "",
  };

  await endorsement.save();

  res.json({
    message: `Endorsement ${action}ed successfully`,
    endorsement: await endorsement.populate(
      "fromUser toUser",
      "name email username"
    ),
  });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserById,
  getAllVerifications,
  approveVerification,
  rejectVerification,
  getPendingEndorsements,
  validateEndorsement,
};

