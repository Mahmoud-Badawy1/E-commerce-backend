const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const userModel = require("../models/userModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.getMyData = asyncHandler(async (req, res, next) => {
  const document = await userModel.findById(req.user._id);
  if (!document) {
    return next(new ApiError(`No document For This id : ${req.user._id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.updateMyData = asyncHandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      dob: req.body.dob,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document For This Id : ${req.user._id}`, 404));
  }
  res.status(200).json({ data: document });
});

// Upload avatar to Cloudinary
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("Please upload an avatar image", 400));
  }

  try {
    // Upload to Cloudinary
    const avatarUrl = await uploadToCloudinary.uploadSingle(
      req.file.buffer, 
      "avatars", 
      400, // width
      400  // height
    );

    // Delete old avatar from Cloudinary if exists
    const user = await userModel.findById(req.user._id);
    if (user.avatar) {
      await uploadToCloudinary.deleteFromCloudinary(user.avatar);
    }

    // Update user with new avatar URL
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Avatar uploaded successfully",
      data: {
        avatar: avatarUrl,
        user: updatedUser,
      },
    });
  } catch (error) {
    return next(new ApiError(`Avatar upload failed: ${error.message}`, 500));
  }
});

// Remove avatar
exports.removeAvatar = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  
  if (!user.avatar) {
    return next(new ApiError("No avatar found", 400));
  }

  // Delete from Cloudinary
  await uploadToCloudinary.deleteFromCloudinary(user.avatar);

  // Remove from user document
  user.avatar = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Avatar removed successfully",
    data: user,
  });
});

exports.updateMyPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.newPassword, 8),
      changedPasswordAt: Date.now(),
    },
    {
      new: true,
    }
  );
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

exports.deactivateMyUser = asyncHandler(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  res.status(200).json({ message: "Deactivated Success" });
});
