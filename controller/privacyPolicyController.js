const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const privacyPolicyModel = require("../models/privacyPolicyModel");

// Get active privacy policy (public)
exports.getPrivacyPolicy = asyncHandler(async (req, res, next) => {
  const privacyPolicy = await privacyPolicyModel.findOne({ isActive: true });

  if (!privacyPolicy) {
    return next(new ApiError("Privacy policy not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: privacyPolicy,
  });
});

// Get all privacy policies (admin only)
exports.getAllPrivacyPolicies = asyncHandler(async (req, res, next) => {
  const privacyPolicies = await privacyPolicyModel.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: privacyPolicies.length,
    data: privacyPolicies,
  });
});

// Create privacy policy (admin only)
exports.createPrivacyPolicy = asyncHandler(async (req, res, next) => {
  const { content, version } = req.body;

  const privacyPolicy = await privacyPolicyModel.create({
    content,
    version: version || "1.0",
    updatedBy: req.user._id,
    isActive: true, // This will automatically deactivate others via pre-save middleware
  });

  res.status(201).json({
    status: "success",
    message: "Privacy policy created successfully",
    data: privacyPolicy,
  });
});

// Update privacy policy (admin only)
exports.updatePrivacyPolicy = asyncHandler(async (req, res, next) => {
  const { content, version } = req.body;

  const privacyPolicy = await privacyPolicyModel.findByIdAndUpdate(
    req.params.id,
    {
      content,
      version: version || "1.0", 
      updatedBy: req.user._id,
    },
    { new: true, runValidators: true }
  );

  if (!privacyPolicy) {
    return next(new ApiError("Privacy policy not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Privacy policy updated successfully",
    data: privacyPolicy,
  });
});

// Activate privacy policy (admin only)
exports.activatePrivacyPolicy = asyncHandler(async (req, res, next) => {
  const privacyPolicy = await privacyPolicyModel.findById(req.params.id);

  if (!privacyPolicy) {
    return next(new ApiError("Privacy policy not found", 404));
  }

  privacyPolicy.isActive = true;
  await privacyPolicy.save(); // This will deactivate others via pre-save middleware

  res.status(200).json({
    status: "success",
    message: "Privacy policy activated successfully",
    data: privacyPolicy,
  });
});

// Delete privacy policy (admin only)
exports.deletePrivacyPolicy = asyncHandler(async (req, res, next) => {
  const privacyPolicy = await privacyPolicyModel.findById(req.params.id);

  if (!privacyPolicy) {
    return next(new ApiError("Privacy policy not found", 404));
  }

  if (privacyPolicy.isActive) {
    return next(new ApiError("Cannot delete active privacy policy", 400));
  }

  await privacyPolicyModel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Privacy policy deleted successfully",
  });
});