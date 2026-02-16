const express = require("express");
const deliveryController = require("../controller/deliveryController");
const deliveryValidator = require("../validators/deliveryValidator");
const authController = require("../controller/authController");

const router = express.Router();

// All routes require authentication and delivery role
router.use(authController.protect, authController.allowedTo("delivery"));

// Delivery profile management
router
  .route("/profile")
  .get(deliveryController.getMyProfile)
  .post(
    deliveryValidator.createDeliveryProfileValidator,
    deliveryController.createDeliveryProfile
  )
  .put(deliveryController.updateMyProfile);

// Status and location updates
router
  .route("/status")
  .put(
    deliveryValidator.updateDeliveryStatusValidator,
    deliveryController.updateStatus
  );

router
  .route("/location")
  .put(
    deliveryValidator.updateLocationValidator,
    deliveryController.updateLocation
  );

// Order management
router
  .route("/orders/nearby")
  .get(deliveryController.getNearbyOrders);

router
  .route("/orders/assigned")
  .get(deliveryController.getMyAssignedOrders);

router
  .route("/orders/:id/status")
  .put(
    deliveryValidator.updateOrderStatusValidator,
    deliveryController.updateOrderStatus
  );

// Statistics
router
  .route("/stats")
  .get(deliveryController.getMyStats);

module.exports = router;