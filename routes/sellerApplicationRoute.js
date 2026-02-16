const express = require("express");
const sellerApplicationController = require("../controller/sellerApplicationController");
const sellerApplicationValidator = require("../validators/sellerApplicationValidator");
const authController = require("../controller/authController");

const router = express.Router();

// Customer routes (require authentication)
router.use(authController.protect);

// Customer: Check if eligible to apply
router
  .route("/check-eligibility")
  .get(
    authController.allowedTo("customer", "affiliate"), // Allow affiliates too
    sellerApplicationController.checkEligibility
  );

// Customer: Submit seller application
router
  .route("/apply")
  .post(
    authController.allowedTo("customer"),
    sellerApplicationValidator.submitApplicationValidator,
    sellerApplicationController.submitApplication
  );

// Customer: Get my application status
router
  .route("/my-status")
  .get(
    authController.allowedTo("customer"),
    sellerApplicationController.getMyApplicationStatus
  );

// Customer: Update my pending application
router
  .route("/my-application")
  .put(
    authController.allowedTo("customer"),
    sellerApplicationValidator.updateApplicationValidator,
    sellerApplicationController.updateMyApplication
  );

// Admin routes
router.use(authController.allowedTo("admin"));

// Admin: Get all applications and stats
router
  .route("/admin")
  .get(sellerApplicationController.getAllApplications);

router
  .route("/admin/stats")
  .get(sellerApplicationController.getApplicationStats);

// Admin: Application management
router
  .route("/admin/:id")
  .get(
    sellerApplicationValidator.getApplicationValidator,
    sellerApplicationController.getApplicationDetails
  );

router
  .route("/admin/:id/approve")
  .put(
    sellerApplicationValidator.approveApplicationValidator,
    sellerApplicationController.approveApplication
  );

router
  .route("/admin/:id/decline")
  .put(
    sellerApplicationValidator.declineApplicationValidator,
    sellerApplicationController.declineApplication
  );

router
  .route("/admin/:id/under-review")
  .put(
    sellerApplicationValidator.setUnderReviewValidator,
    sellerApplicationController.setUnderReview
  );

module.exports = router;