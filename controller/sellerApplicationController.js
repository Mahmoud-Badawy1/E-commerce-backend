const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sellerApplicationModel = require("../models/sellerApplicationModel");
const sellerModel = require("../models/sellerModel");
const userModel = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");

// Customer: Check if I can apply to become a seller
exports.checkEligibility = asyncHandler(async (req, res, next) => {
  // Check if user is already a seller
  if (req.user.role === "seller") {
    return res.status(200).json({
      status: "success",
      data: {
        canApply: false,
        reason: "You are already a seller",
        userRole: req.user.role,
      },
    });
  }

  // Check if user has an existing application
  const existingApplication = await sellerApplicationModel.findOne({ 
    user: req.user._id 
  }).select("status createdAt");

  if (existingApplication) {
    return res.status(200).json({
      status: "success",
      data: {
        canApply: existingApplication.status === "declined" ? true : false,
        reason: existingApplication.status === "declined" 
          ? "You can reapply after your previous application was declined"
          : `You already have a ${existingApplication.status} application`,
        applicationStatus: existingApplication.status,
        applicationDate: existingApplication.createdAt,
      },
    });
  }

  // User can apply
  res.status(200).json({
    status: "success",
    data: {
      canApply: true,
      reason: "You are eligible to apply to become a seller",
      userRole: req.user.role,
    },
  });
});

// Customer: Submit seller application
exports.submitApplication = asyncHandler(async (req, res, next) => {
  // Check if user already has a pending, approved, or under_review application
  const existingApplication = await sellerApplicationModel.findOne({ 
    user: req.user._id,
    status: { $in: ["pending", "approved", "under_review"] }
  });

  if (existingApplication) {
    return next(new ApiError(`You already have a ${existingApplication.status} seller application`, 400));
  }

  // Check if user is already a seller
  const existingSeller = await sellerModel.findOne({ userId: req.user._id });
  if (existingSeller) {
    return next(new ApiError("You are already a seller", 400));
  }

  // If user had a declined application, delete it and allow reapplication
  const declinedApplication = await sellerApplicationModel.findOne({ 
    user: req.user._id,
    status: "declined" 
  });
  
  if (declinedApplication) {
    await sellerApplicationModel.findByIdAndDelete(declinedApplication._id);
  }

  const application = await sellerApplicationModel.create({
    user: req.user._id,
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    message: "Seller application submitted successfully",
    data: application,
  });
});

// Customer: Get my application status
exports.getMyApplicationStatus = asyncHandler(async (req, res, next) => {
  const application = await sellerApplicationModel.findOne({ user: req.user._id });

  if (!application) {
    return next(new ApiError("No seller application found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      applicationId: application._id,
      status: application.status,
      submittedAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      approvalReason: application.approvalReason,
      declineReason: application.declineReason,
      businessName: application.businessName,
    },
  });
});

// Customer: Update pending application
exports.updateMyApplication = asyncHandler(async (req, res, next) => {
  const application = await sellerApplicationModel.findOne({ 
    user: req.user._id,
    status: "pending" 
  });

  if (!application) {
    return next(new ApiError("No pending application found to update", 404));
  }

  const updatedApplication = await sellerApplicationModel.findByIdAndUpdate(
    application._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Application updated successfully",
    data: updatedApplication,
  });
});

// Admin: Get all seller applications
exports.getAllApplications = asyncHandler(async (req, res, next) => {
  let filter = {};
  
  // Filter by status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const documentsCount = await sellerApplicationModel.countDocuments(filter);
  const apiFeatures = new ApiFeatures(sellerApplicationModel.find(filter), req.query)
    .filter()
    .limit()
    .paginate(documentsCount)
    .sort();

  const { mongooseQuery, paginationResult } = apiFeatures;
  const applications = await mongooseQuery;

  res.status(200).json({
    status: "success",
    results: applications.length,
    paginationResult,
    data: applications,
  });
});

// Admin: Get specific application details  
exports.getApplicationDetails = asyncHandler(async (req, res, next) => {
  const application = await sellerApplicationModel.findById(req.params.id);

  if (!application) {
    return next(new ApiError("Application not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: application,
  });
});

// Admin: Approve seller application
exports.approveApplication = asyncHandler(async (req, res, next) => {
  const { approvalReason } = req.body;
  
  const application = await sellerApplicationModel.findById(req.params.id);

  if (!application) {
    return next(new ApiError("Application not found", 404));
  }

  if (application.status === "approved") {
    return next(new ApiError("Application is already approved", 400));
  }

  // Check if user already has a seller profile (edge case)
  const existingSeller = await sellerModel.findOne({ userId: application.user._id });
  if (existingSeller) {
    return next(new ApiError("User already has a seller profile", 400));
  }

  // Update application status
  application.status = "approved";
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.approvalReason = approvalReason || "Application meets all requirements";
  await application.save();

  // Update user role to seller
  await userModel.findByIdAndUpdate(application.user._id, { role: "seller" });

  // Create seller profile
  await sellerModel.create({
    userId: application.user._id,
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.user.email,
    phone: application.phone,
    country: application.country,
    address: application.address,
  });

  res.status(200).json({
    status: "success",
    message: "Application approved successfully. Seller profile created.",
    data: application,
  });
});

// Admin: Decline seller application
exports.declineApplication = asyncHandler(async (req, res, next) => {
  const { declineReason } = req.body;

  if (!declineReason) {
    return next(new ApiError("Decline reason is required", 400));
  }

  const application = await sellerApplicationModel.findById(req.params.id);

  if (!application) {
    return next(new ApiError("Application not found", 404));
  }

  if (application.status === "declined") {
    return next(new ApiError("Application is already declined", 400));
  }

  // Update application status
  application.status = "declined";
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.declineReason = declineReason;
  await application.save();

  res.status(200).json({
    status: "success",
    message: "Application declined successfully",
    data: application,
  });
});

// Admin: Set application under review
exports.setUnderReview = asyncHandler(async (req, res, next) => {
  const { notes } = req.body;

  const application = await sellerApplicationModel.findById(req.params.id);

  if (!application) {
    return next(new ApiError("Application not found", 404));
  }

  application.status = "under_review";
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.notes = notes || "";
  await application.save();

  res.status(200).json({
    status: "success",
    message: "Application set to under review",
    data: application,
  });
});

// Admin: Get application statistics
exports.getApplicationStats = asyncHandler(async (req, res, next) => {
  const stats = await sellerApplicationModel.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalApplications = await sellerApplicationModel.countDocuments({});
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const thisMonthApplications = await sellerApplicationModel.countDocuments({
    createdAt: { $gte: thisMonth }
  });

  res.status(200).json({
    status: "success",
    data: {
      totalApplications,
      thisMonthApplications,
      statusBreakdown: stats,
    },
  });
});