const express = require("express");
const paymentMethodController = require("../controller/paymentMethodController");
const paymentMethodValidator = require("../validators/paymentMethodValidator");
const authController = require("../controller/authController");

const router = express.Router();

// All routes require authentication 
router.use(authController.protect, authController.allowedTo("customer"));

router
  .route("/")
  .get(paymentMethodController.getMyPaymentMethods)
  .post(
    paymentMethodValidator.addPaymentMethodValidator,
    paymentMethodController.addPaymentMethod
  );

router
  .route("/:id")
  .get(
    paymentMethodValidator.getPaymentMethodValidator,
    paymentMethodController.getPaymentMethod
  )
  .put(
    paymentMethodValidator.getPaymentMethodValidator,
    paymentMethodValidator.updatePaymentMethodValidator,
    paymentMethodController.updatePaymentMethod
  )
  .delete(
    paymentMethodValidator.getPaymentMethodValidator,
    paymentMethodController.removePaymentMethod
  );

router
  .route("/:id/default")
  .put(
    paymentMethodValidator.getPaymentMethodValidator,
    paymentMethodController.setDefaultPaymentMethod
  );

module.exports = router;