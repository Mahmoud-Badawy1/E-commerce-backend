const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const deliveryModel = require("../models/deliveryModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");

// Create delivery profile
exports.createDeliveryProfile = asyncHandler(async (req, res, next) => {
  const existingProfile = await deliveryModel.findOne({ userId: req.user._id });
  if (existingProfile) {
    return next(new ApiError("Delivery profile already exists", 400));
  }

  const deliveryProfile = await deliveryModel.create({
    userId: req.user._id,
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    data: deliveryProfile,
  });
});

// Get my delivery profile
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const profile = await deliveryModel.findOne({ userId: req.user._id });
  if (!profile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: profile,
  });
});

// Update my delivery profile
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  const profile = await deliveryModel.findOneAndUpdate(
    { userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!profile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: profile,
  });
});

// Update delivery status (available/busy/offline)
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const profile = await deliveryModel.findOneAndUpdate(
    { userId: req.user._id },
    { status },
    { new: true, runValidators: true }
  );

  if (!profile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: profile,
  });
});

// Update location in real-time
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, city } = req.body;
  
  // Update user location
  await userModel.findByIdAndUpdate(req.user._id, {
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    city: city,
  });

  // Update delivery profile city
  const profile = await deliveryModel.findOneAndUpdate(
    { userId: req.user._id },
    { currentCity: city },
    { new: true, runValidators: true }
  );

  if (!profile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Location updated successfully",
    data: profile,
  });
});

// Get nearby orders (same city)
exports.getNearbyOrders = asyncHandler(async (req, res, next) => {
  const deliveryProfile = await deliveryModel.findOne({ userId: req.user._id });
  if (!deliveryProfile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  const filter = {
    status: { $in: ["Approved", "shipping"] },
    deliveryStatus: "unassigned",
    // Find orders from customers in the same city
    $or: [
      { "customer.city": deliveryProfile.currentCity },
      { "customer.addresses.city": deliveryProfile.currentCity }
    ],
  };

  const documentsCount = await orderModel.countDocuments(filter);
  const apiFeatures = new ApiFeatures(orderModel.find(filter), req.query)
    .filter()
    .limit()
    .paginate(documentsCount)
    .sort();

  const { mongooseQuery, paginationResult } = apiFeatures;
  const orders = await mongooseQuery;

  res.status(200).json({
    status: "success",
    results: orders.length,
    paginationResult,
    data: orders,
  });
});

// Get assigned orders
exports.getMyAssignedOrders = asyncHandler(async (req, res, next) => {
  const filter = {
    deliveryGuy: req.user._id,
    deliveryStatus: { $in: ["assigned", "picked_up", "in_transit"] },
  };

  const documentsCount = await orderModel.countDocuments(filter);
  const apiFeatures = new ApiFeatures(orderModel.find(filter), req.query)
    .filter()
    .limit()
    .paginate(documentsCount)
    .sort();

  const { mongooseQuery, paginationResult } = apiFeatures;
  const orders = await mongooseQuery;

  res.status(200).json({
    status: "success",
    results: orders.length,
    paginationResult,
    data: orders,
  });
});

// Update order delivery status
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { deliveryStatus, deliveryNotes } = req.body;

  const order = await orderModel.findOne({
    _id: id,
    deliveryGuy: req.user._id,
  });

  if (!order) {
    return next(new ApiError("Order not found or not assigned to you", 404));
  }

  const updateData = { deliveryStatus, deliveryNotes };

  // Set timestamps based on status
  if (deliveryStatus === "picked_up") {
    updateData.pickedUpAt = new Date();
    updateData.status = "shipping";
  } else if (deliveryStatus === "delivered") {
    updateData.deliveredAt = new Date();
    updateData.status = "delivered";
    
    // Update delivery guy earnings and total deliveries
    const deliveryProfile = await deliveryModel.findOne({ userId: req.user._id });
    if (deliveryProfile) {
      deliveryProfile.totalDeliveries += 1;
      deliveryProfile.earnings += 10; // Fixed delivery fee, can be made dynamic
      await deliveryProfile.save();
    }
  }

  const updatedOrder = await orderModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// Get delivery stats
exports.getMyStats = asyncHandler(async (req, res, next) => {
  const profile = await deliveryModel.findOne({ userId: req.user._id });
  if (!profile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayStart.setHours(23, 59, 59, 999);

  const todayDeliveries = await orderModel.countDocuments({
    deliveryGuy: req.user._id,
    deliveryStatus: "delivered",
    deliveredAt: { $gte: todayStart, $lte: todayEnd },
  });

  const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const monthlyDeliveries = await orderModel.countDocuments({
    deliveryGuy: req.user._id,
    deliveryStatus: "delivered",
    deliveredAt: { $gte: thisMonthStart },
  });

  res.status(200).json({
    status: "success",
    data: {
      profile,
      todayDeliveries,
      monthlyDeliveries,
    },
  });
});