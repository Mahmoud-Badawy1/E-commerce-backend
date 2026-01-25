const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const sellerModel = require("../models/sellerModel");
const userModel = require("../models/userModel");

// Create seller profile (called after user registration)
exports.createSellerProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, country, address, gender, dateOfBirth } = req.body;

  const seller = await sellerModel.create({
    userId: req.user._id,
    firstName,
    lastName,
    email,
    phone,
    country,
    address,
    gender,
    dateOfBirth,
  });

  res.status(201).json({ data: seller, message: "Seller profile created successfully" });
});

// Get seller profile
exports.getSellerProfile = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found. Please create your profile first.", 404));
  }
  res.status(200).json({ data: seller });
});

// Update seller profile (firstName, lastName, gender, dateOfBirth, profileImage)
exports.updateSellerProfile = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOneAndUpdate(
    { userId: req.user._id },
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      profileImage: req.body.profileImage,
    },
    { new: true, runValidators: true }
  );
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }
  res.status(200).json({ data: seller });
});

// Update contact details (phone, country, address)
exports.updateContactDetails = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOneAndUpdate(
    { userId: req.user._id },
    {
      phone: req.body.phone,
      country: req.body.country,
      address: req.body.address,
    },
    { new: true, runValidators: true }
  );
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }
  res.status(200).json({ data: seller });
});

// Update seller password
exports.updateSellerPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    {
      password: await bcrypt.hash(req.body.newPassword, 8),
      changedPasswordAt: Date.now(),
    },
    { new: true }
  );
  const token = createToken(user._id);
  res.status(200).json({ message: "Password updated successfully", token });
});

// Deactivate seller account
exports.deactivateSellerAccount = asyncHandler(async (req, res, next) => {
  await sellerModel.findOneAndUpdate(
    { userId: req.user._id },
    { active: false }
  );
  res.status(200).json({ message: "Account deactivated successfully" });
});

