const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const socialLinksModel = require("../models/socialLinksModel");

// Get social links (public)
exports.getSocialLinks = asyncHandler(async (req, res, next) => {
  let socialLinks = await socialLinksModel.findOne({}).sort({ createdAt: -1 });

  // If no social links exist, return empty object
  if (!socialLinks) {
    socialLinks = {
      whatsapp: "",
      phone: "",
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
    };
  }

  res.status(200).json({
    status: "success",
    data: socialLinks,
  });
});

// Update social links (admin only)
exports.updateSocialLinks = asyncHandler(async (req, res, next) => {
  const { whatsapp, phone, instagram, facebook, twitter, website } = req.body;

  let socialLinks = await socialLinksModel.findOne({});

  if (socialLinks) {
    // Update existing
    socialLinks.whatsapp = whatsapp || socialLinks.whatsapp;
    socialLinks.phone = phone || socialLinks.phone;
    socialLinks.instagram = instagram || socialLinks.instagram;
    socialLinks.facebook = facebook || socialLinks.facebook;
    socialLinks.twitter = twitter || socialLinks.twitter;
    socialLinks.website = website || socialLinks.website;
    socialLinks.updatedBy = req.user._id;
    
    await socialLinks.save();
  } else {
    // Create new
    socialLinks = await socialLinksModel.create({
      whatsapp: whatsapp || "",
      phone: phone || "",
      instagram: instagram || "",
      facebook: facebook || "",
      twitter: twitter || "",
      website: website || "",
      updatedBy: req.user._id,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Social links updated successfully",
    data: socialLinks,
  });
});