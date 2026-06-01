const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    profileViews: {
      type: Number,
      default: 0,
    },

    projectViews: {
      type: Number,
      default: 0,
    },

    endorsementsCount: {
      type: Number,
      default: 0,
    },

    verificationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ProfileAnalytics",
  analyticsSchema
);