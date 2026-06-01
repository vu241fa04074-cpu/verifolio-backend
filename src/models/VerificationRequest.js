const mongoose = require("mongoose");

const verificationRequestSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      itemType: {
        type: String,
        enum: [
          "project",
          "certification",
          "achievement",
          "work",
        ],
        required: true,
      },

      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      proofFile: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },

      remarks: {
        type: String,
        default: "",
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "VerificationRequest",
  verificationRequestSchema
);