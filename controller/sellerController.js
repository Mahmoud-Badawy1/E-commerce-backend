const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const sellerModel = require("../models/sellerModel");
const userModel = require("../models/userModel");
const findOrCreateSellerProfile = require("../utils/findOrCreateSellerProfile");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

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
  const seller = await findOrCreateSellerProfile(req.user);
  res.status(200).json({ data: seller });
});

// Update seller profile (firstName, lastName, gender, dateOfBirth, profileImage)
exports.updateSellerProfile = asyncHandler(async (req, res, next) => {
  await findOrCreateSellerProfile(req.user);
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
  res.status(200).json({ data: seller });
});

// Update contact details (phone, country, address)
exports.updateContactDetails = asyncHandler(async (req, res, next) => {
  await findOrCreateSellerProfile(req.user);
  const seller = await sellerModel.findOneAndUpdate(
    { userId: req.user._id },
    {
      phone: req.body.phone,
      country: req.body.country,
      address: req.body.address,
    },
    { new: true, runValidators: true }
  );
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

// Upload seller profile image to Cloudinary
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("Please upload a profile image", 400));
  }

  try {
    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary.uploadSingle(
      req.file.buffer, 
      "sellers", 
      400, // width
      400  // height
    );

    // Delete old image from Cloudinary if exists
    const seller = await findOrCreateSellerProfile(req.user);
    if (seller && seller.profileImage && seller.profileImage.includes('cloudinary')) {
      await uploadToCloudinary.deleteFromCloudinary(seller.profileImage);
    }

    // Update seller with new image URL
    const updatedSeller = await sellerModel.findOneAndUpdate(
      { userId: req.user._id },
      { profileImage: imageUrl },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Profile image uploaded successfully",
      data: {
        profileImage: imageUrl,
        seller: updatedSeller,
      },
    });
  } catch (error) {
    return next(new ApiError(`Image upload failed: ${error.message}`, 500));
  }
});

// Remove seller profile image
exports.removeProfileImage = asyncHandler(async (req, res, next) => {
  const seller = await findOrCreateSellerProfile(req.user);

  if (!seller.profileImage) {
    return next(new ApiError("No profile image found", 400));
  }

  // Delete from Cloudinary if it's a Cloudinary URL
  if (seller.profileImage.includes('cloudinary')) {
    await uploadToCloudinary.deleteFromCloudinary(seller.profileImage);
  }

  // Remove from seller document
  seller.profileImage = undefined;
  await seller.save();

  res.status(200).json({
    status: "success",
    message: "Profile image removed successfully",
    data: seller,
  });
});

