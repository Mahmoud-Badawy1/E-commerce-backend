const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Privacy policy content is required"],
      minlength: [100, "Privacy policy content is too short"],
    },
    version: {
      type: String,
      required: [true, "Version is required"],
      default: "1.0",
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Updated by admin is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one active privacy policy
privacyPolicySchema.pre("save", async function (next) {
  if (this.isActive && this.isModified("isActive")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

privacyPolicySchema.pre(/^find/, function (next) {
  this.populate({
    path: "updatedBy",
    select: "name email",
  });
  next();
});

const privacyPolicyModel = mongoose.model("PrivacyPolicy", privacyPolicySchema);

module.exports = privacyPolicyModel;