const mongoose = require("mongoose");

const endorsementSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    skill: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // Admin validation: stores admin decision & remarks
    adminValidation: {
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      validatedAt: Date,
      remarks: String,
    },

    // How endorsements work:
    // 1. User A sends skill endorsement to User B with optional message
    // 2. Endorsement saved as "pending" status to database
    // 3. Admin reviews pending endorsements via GET /api/admin/endorsements
    // 4. Admin validates (approve/reject) with remarks via PUT /api/admin/endorsements/:id
    // 5. Approved endorsements display on User B's public profile with verification badge
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
endorsementSchema.index({ toUser: 1, status: 1 });
endorsementSchema.index({ fromUser: 1, toUser: 1 });

module.exports = mongoose.model("Endorsement", endorsementSchema);
