const sellerModel = require("../models/sellerModel");
const sellerApplicationModel = require("../models/sellerApplicationModel");
const ApiError = require("./apiError");

/**
 * Finds the seller profile for the given user, or auto-creates it if they
 * have an APPROVED seller application and no profile exists yet.
 *
 * Only creates a profile when the application status === "approved".
 * Any other case (no application, pending, declined, under_review) returns
 * a 403 error to prevent unauthorized access.
 *
 * @param {Object} user - The `req.user` document (must have _id, email, name)
 * @returns {Promise<Document>} The seller Mongoose document
 */
const findOrCreateSellerProfile = async (user) => {
  // 1. Happy-path: profile already exists
  let seller = await sellerModel.findOne({ userId: user._id });
  if (seller) return seller;

  // 2. Check for an approved application
  const application = await sellerApplicationModel.findOne({ user: user._id });

  if (!application) {
    throw new ApiError("No seller application found. Please submit an application first.", 403);
  }

  if (application.status !== "approved") {
    throw new ApiError(
      `Your seller application is currently "${application.status}". Access is only granted after approval.`,
      403
    );
  }

  // 3. Create the profile from approved application data
  try {
    seller = await sellerModel.create({
      userId: user._id,
      firstName: application.firstName,
      lastName: application.lastName,
      email: user.email,
      phone: application.phone || user.phone || "",
      country: application.country || "",
      address: application.address || "",
    });
  } catch (err) {
    // E11000 duplicate key – another request already created it in parallel
    if (err.code === 11000) {
      seller = await sellerModel.findOne({ userId: user._id });
    } else {
      throw err;
    }
  }

  return seller;
};

module.exports = findOrCreateSellerProfile;
