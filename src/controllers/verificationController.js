const VerificationRequest = require("../models/VerificationRequest");
const Project = require("../models/Project");
const Certification = require("../models/Certification");
const Achievement = require("../models/Achievement");
const ProfileAnalytics = require("../models/ProfileAnalytics");

// CREATE REQUEST - with duplicate check
const createVerificationRequest = async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    // Prevent duplicate pending request
    const existing = await VerificationRequest.findOne({
      user: req.user._id,
      itemType,
      itemId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "A pending verification request already exists for this item.",
      });
    }

    const request = await VerificationRequest.create({
      user: req.user._id,
      itemType,
      itemId,
      proofFile: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MY REQUESTS
const getMyRequests = async (req, res) => {
  try {
    const requests = await VerificationRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN GET ALL - with pagination
const getAllRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [requests, total] = await Promise.all([
      VerificationRequest.find(filter)
        .populate("user", "name email username")
        .populate("verifiedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VerificationRequest.countDocuments(filter),
    ]);

    res.json({
      requests,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// APPROVE - also updates original item verified = true
const approveRequest = async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "approved";
    request.remarks = req.body.remarks || "";
    request.verifiedBy = req.user._id;
    await request.save();

    // Update original item
    if (request.itemType === "project") {
      await Project.findByIdAndUpdate(request.itemId, { verified: true });
    } else if (request.itemType === "certification") {
      await Certification.findByIdAndUpdate(request.itemId, { verified: true });
    } else if (request.itemType === "achievement") {
      await Achievement.findByIdAndUpdate(request.itemId, { verified: true });
    }

    // Update analytics
    let analytics = await ProfileAnalytics.findOne({ user: request.user });
    if (!analytics) {
      analytics = await ProfileAnalytics.create({ user: request.user });
    }
    analytics.verificationCount += 1;
    await analytics.save();

    res.json({ message: "Request approved", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT
const rejectRequest = async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    request.remarks = req.body.remarks || "";
    request.verifiedBy = req.user._id;
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVerificationRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
};
