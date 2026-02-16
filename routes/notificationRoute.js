const express = require("express");
const notificationController = require("../controller/notificationController");
const notificationValidator = require("../validators/notificationValidator");
const authController = require("../controller/authController");

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

// User notification management
router
  .route("/")
  .get(notificationController.getMyNotifications);

router
  .route("/preferences")
  .get(notificationController.getMyNotificationPreferences)
  .put(
    notificationValidator.updateNotificationPreferencesValidator,
    notificationController.updateMyNotificationPreferences
  );

router
  .route("/mark-all-read")
  .put(notificationController.markAllAsRead);

router
  .route("/:id")
  .put(notificationController.markAsRead)
  .delete(notificationController.deleteNotification);

// Admin only routes
router
  .route("/admin/send")
  .post(
    authController.allowedTo("admin"),
    notificationValidator.sendNotificationValidator,
    notificationController.sendNotification
  );

router
  .route("/admin/stats")
  .get(
    authController.allowedTo("admin"),
    notificationController.getNotificationStats
  );

module.exports = router;