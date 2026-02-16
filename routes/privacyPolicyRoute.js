const express = require("express");
const privacyPolicyController = require("../controller/privacyPolicyController");
const authController = require("../controller/authController");

const router = express.Router();

// Public route to get active privacy policy
router.route("/").get(privacyPolicyController.getPrivacyPolicy);
router.route("/current").get(privacyPolicyController.getPrivacyPolicy);

// Admin only routes
router.use(authController.protect, authController.allowedTo("admin"));

router
  .route("/admin")
  .get(privacyPolicyController.getAllPrivacyPolicies)
  .post(privacyPolicyController.createPrivacyPolicy);

router
  .route("/admin/:id")
  .put(privacyPolicyController.updatePrivacyPolicy)
  .delete(privacyPolicyController.deletePrivacyPolicy);

router
  .route("/admin/:id/activate")
  .put(privacyPolicyController.activatePrivacyPolicy);

module.exports = router;