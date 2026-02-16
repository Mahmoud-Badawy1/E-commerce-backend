const express = require("express");
const socialLinksController = require("../controller/socialLinksController");
const authController = require("../controller/authController");

const router = express.Router();

// Public route to get social links
router
  .route("/")
  .get(socialLinksController.getSocialLinks)
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    socialLinksController.updateSocialLinks
  );

module.exports = router;