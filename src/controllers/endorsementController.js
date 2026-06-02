const Endorsement = require("../models/Endorsement");
const ProfileAnalytics = require("../models/ProfileAnalytics");
const asyncHandler = require("express-async-handler");

// CREATE ENDORSEMENT (new endorsements start as "pending" for admin validation)
const createEndorsement = asyncHandler(async (req, res) => {
  const { toUser, skill, message } = req.body;

  // Prevent self-endorsement
  if (toUser === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot endorse yourself");
  }

  // Create endorsement with "pending" status
  const endorsement = await Endorsement.create({
    fromUser: req.user._id,
    toUser,
    skill,
    message,
    status: "pending",
  });

  res.status(201).json({
    message: "Endorsement created. Awaiting admin validation.",
    endorsement,
  });
});

// GET USER'S APPROVED ENDORSEMENTS (only show publicly on profile if approved)
const getUserEndorsements = asyncHandler(async (req, res) => {
  const endorsements = await Endorsement.find({
    toUser: req.params.userId,
    status: "approved", // Only approved endorsements show on profile
  })
    .populate("fromUser", "name username profileImage")
    .lean()
    .sort({ createdAt: -1 });

  res.json(endorsements);
});

// GET CURRENT USER'S PENDING ENDORSEMENTS (for their review)
const getMyPendingEndorsements = asyncHandler(async (req, res) => {
  const endorsements = await Endorsement.find({
    toUser: req.user._id,
    status: "pending",
  })
    .populate("fromUser", "name username profileImage email")
    .lean()
    .sort({ createdAt: -1 });

  res.json(endorsements);
});

module.exports = {
  createEndorsement,
  getUserEndorsements,
  getMyPendingEndorsements,
};
