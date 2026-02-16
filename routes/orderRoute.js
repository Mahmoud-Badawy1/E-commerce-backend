const express = require("express");
const orderController = require("../controller/orderController");

const router = express.Router();
const authController = require("../controller/authController");
const orderValidator = require("../validators/orderValidator");

router.route("/webhook-paymob").post(orderController.webhookCheckout);

router
  .route("/")
  .get(
    authController.protect,
    orderController.filterOrderForUsers,
    orderController.getAllOrders
  );

// Seller dashboard orders
router
  .route("/seller")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.getSellerOrders
  );

router
  .route("/seller/:id")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.getSellerOrderDetails
  )
  .put(
    authController.protect,
    authController.allowedTo("seller"),
    orderValidator.updateOrderValidator,
    orderController.updateSellerOrder
  )
  .delete(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.deleteSellerOrder
  );
router
  .route("/:id")
  .post(
    authController.protect,
    // green flag
    authController.allowedTo("customer","seller"),
    orderController.createCashOrder
  );
router
  .route("/checkout-session/:id")
  .get( 
    authController.protect,
    authController.allowedTo("customer"),
    orderController.checkOutSession
  );

router
  .route("/:id")
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    orderController.updateOrderStatus
  );

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    orderController.deleteOrder
  );

// Admin delivery assignment routes
router
  .route("/admin/assign-delivery")
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    orderController.assignDeliveryGuy
  );

router
  .route("/admin/unassign-delivery/:orderId")
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    orderController.unassignDeliveryGuy
  );

router
  .route("/admin/delivery-guys")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    orderController.getDeliveryGuys
  );

// Customer delivery details route
router
  .route("/delivery/:orderId")
  .get(
    authController.protect,
    authController.allowedTo("customer"),
    orderController.getMyOrderDeliveryDetails
  );

module.exports = router;
