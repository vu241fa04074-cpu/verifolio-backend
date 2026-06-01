const Profile = require("../models/Profile");
const User = require("../models/User");
const Project = require("../models/Project");
const Certification = require("../models/Certification");
const Achievement = require("../models/Achievement");
const Endorsement = require("../models/Endorsement");
const ProfileAnalytics = require("../models/ProfileAnalytics");

const parseJsonField = (value, fallback) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseBooleanField = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id })
      .populate("user", "name email username role");

    if (!profile) {
      // Auto-create empty profile on first access
      profile = await Profile.create({ user: req.user._id });
      profile = await Profile.findById(profile._id)
        .populate("user", "name email username role");
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE OR UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const {
      bio,
      headline,
    } = req.body;

    const skills = parseJsonField(req.body.skills, []);
    const education = parseJsonField(req.body.education, []);
    const workExperience = parseJsonField(req.body.workExperience, []);
    const socialLinks = parseJsonField(req.body.socialLinks, {});
    const isPublic = parseBooleanField(req.body.isPublic);

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      if (bio !== undefined) profile.bio = bio;
      if (headline !== undefined) profile.headline = headline;
      if (skills !== undefined) profile.skills = skills;
      if (education !== undefined) profile.education = education;
      if (workExperience !== undefined) profile.workExperience = workExperience;
      if (socialLinks !== undefined) profile.socialLinks = socialLinks;
      if (isPublic !== undefined) profile.isPublic = isPublic;
      if (req.file) profile.profileImage = `/uploads/${req.file.filename}`;

      await profile.save();
      return res.json(profile);
    }

    profile = await Profile.create({
      user: req.user._id,
      bio, headline, skills, education,
      workExperience, socialLinks, isPublic,
      profileImage: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUBLIC PROFILE - full data
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ user: user._id, isPublic: true });

    if (!profile) {
      return res.status(404).json({ message: "Public profile not available" });
    }

    const [projects, certifications, achievements, endorsements, analytics] =
      await Promise.all([
        Project.find({ user: user._id }).sort({ createdAt: -1 }),
        Certification.find({ user: user._id }).sort({ createdAt: -1 }),
        Achievement.find({ user: user._id }).sort({ createdAt: -1 }),
        Endorsement.find({ toUser: user._id })
          .populate("fromUser", "name username")
          .sort({ createdAt: -1 })
          .limit(20),
        ProfileAnalytics.findOne({ user: user._id }),
      ]);

    // Track profile view
    let analyticsDoc = analytics;
    if (!analyticsDoc) {
      analyticsDoc = await ProfileAnalytics.create({ user: user._id });
    }
    analyticsDoc.profileViews += 1;
    await analyticsDoc.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      profile,
      projects,
      certifications,
      achievements,
      endorsements,
      analytics: analyticsDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateProfile, getPublicProfile };
