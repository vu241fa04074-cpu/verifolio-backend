const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    issuer: {
      type: String,
      required: true,
    },

    issueDate: {
      type: String,
    },

    certificateFile: {
      type: String,
      default: "",
    },

    credentialId: {
      type: String,
      default: "",
    },

    credentialUrl: {
      type: String,
      default: "",
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Certification",
  certificationSchema
);