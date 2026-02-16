const express = require("express");
const sellerController = require("../controller/sellerController");
const authController = require("../controller/authController");
const sellerValidator = require("../validators/sellerValidator");
const uploadImageMiddleware = require("../middleWares/uploadImageMiddleware");

const router = express.Router();

router.use(authController.protect);


// Create seller profile (initial setup)
router.post(
  "/create-profile",
  sellerValidator.createSellerProfileValidator,
  sellerController.createSellerProfile
);

// Profile routes
router.get(
  "/profile",
  sellerController.getSellerProfile
);

router.put(
  "/profile",
  sellerValidator.updateSellerProfileValidator,
  sellerController.updateSellerProfile
);

// Profile image upload routes
router.post(
  "/profile-image/upload",
  uploadImageMiddleware.uploadSingleImage("profileImage"),
  sellerController.uploadProfileImage
);

router.delete(
  "/profile-image/remove",
  sellerController.removeProfileImage
);

// Contact details routes
router.put(
  "/contact-details",
  sellerValidator.updateContactDetailsValidator,
  sellerController.updateContactDetails
);

// Password routes
router.put(
  "/password",
  sellerValidator.changeSellerPasswordValidator,
  sellerController.updateSellerPassword
);

// Account deactivation
router.delete(
  "/deactivate",
  sellerController.deactivateSellerAccount
);

// Profile image upload routes
router.post(
  "/profile-image/upload",
  uploadImageMiddleware.uploadSingleImage("profileImage"),
  sellerController.uploadProfileImage
);

router.delete(
  "/profile-image/remove",
  sellerController.removeProfileImage
);

module.exports = router;
