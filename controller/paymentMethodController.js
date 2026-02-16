const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const paymentMethodModel = require("../models/paymentMethodModel");

// Add new payment method
exports.addPaymentMethod = asyncHandler(async (req, res, next) => {
  const { cardholderName, last4, brand, expiryMonth, expiryYear, token, isDefault } = req.body;

  const paymentMethod = await paymentMethodModel.create({
    user: req.user._id,
    cardholderName,
    last4,
    brand,
    expiryMonth,
    expiryYear,
    token,
    isDefault: isDefault || false,
  });

  res.status(201).json({
    status: "success",
    message: "Payment method added successfully",
    data: paymentMethod,
  });
});

// Get my payment methods
exports.getMyPaymentMethods = asyncHandler(async (req, res, next) => {
  const paymentMethods = await paymentMethodModel
    .find({ user: req.user._id, isActive: true })
    .sort({ isDefault: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: paymentMethods.length,
    data: paymentMethods,
  });
});

// Get specific payment method
exports.getPaymentMethod = asyncHandler(async (req, res, next) => {
  const paymentMethod = await paymentMethodModel.findOne({
    _id: req.params.id,
    user: req.user._id,
    isActive: true,
  });

  if (!paymentMethod) {
    return next(new ApiError("Payment method not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: paymentMethod,
  });
});

// Set default payment method
exports.setDefaultPaymentMethod = asyncHandler(async (req, res, next) => {
  const paymentMethod = await paymentMethodModel.findOne({
    _id: req.params.id,
    user: req.user._id,
    isActive: true,
  });

  if (!paymentMethod) {
    return next(new ApiError("Payment method not found", 404));
  }

  // Remove default from all other payment methods
  await paymentMethodModel.updateMany(
    { user: req.user._id, _id: { $ne: req.params.id } },
    { isDefault: false }
  );

  // Set this one as default
  paymentMethod.isDefault = true;
  await paymentMethod.save();

  res.status(200).json({
    status: "success",
    message: "Default payment method updated successfully",
    data: paymentMethod,
  });
});

// Remove payment method
exports.removePaymentMethod = asyncHandler(async (req, res, next) => {
  const paymentMethod = await paymentMethodModel.findOne({
    _id: req.params.id,
    user: req.user._id,
    isActive: true,
  });

  if (!paymentMethod) {
    return next(new ApiError("Payment method not found", 404));
  }

  // Soft delete
  paymentMethod.isActive = false;
  await paymentMethod.save();

  // If this was the default, set another one as default
  if (paymentMethod.isDefault) {
    const nextPaymentMethod = await paymentMethodModel.findOne({
      user: req.user._id,
      isActive: true,
    });
    
    if (nextPaymentMethod) {
      nextPaymentMethod.isDefault = true;
      await nextPaymentMethod.save();
    }
  }

  res.status(200).json({
    status: "success",
    message: "Payment method removed successfully",
  });
});

// Update payment method (only cardholder name can be updated)
exports.updatePaymentMethod = asyncHandler(async (req, res, next) => {
  const { cardholderName } = req.body;

  const paymentMethod = await paymentMethodModel.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    },
    { cardholderName },
    { new: true, runValidators: true }
  );

  if (!paymentMethod) {
    return next(new ApiError("Payment method not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Payment method updated successfully",
    data: paymentMethod,
  });
});