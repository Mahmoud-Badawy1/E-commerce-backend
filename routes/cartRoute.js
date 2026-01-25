const express = require("express");

const router = express.Router();

const cartController = require("../controller/cartController");
const cartValidator = require("../validators/cartValidator");
const authController = require("../controller/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("customer","seller"),
    cartController.getAllProductsInCart
  )
  .post(
    authController.protect,
    authController.allowedTo("customer","seller"),
    cartValidator.addProductToCartValidator,
    cartController.addProductToCart
  )
  .delete(
    authController.protect,
    authController.allowedTo("customer","seller"),
    cartController.clearCart
  );

router
  .route("/applyCoupon")
  .put(
    authController.protect,
    authController.allowedTo("customer","seller"),
    cartValidator.applyCouponToCartValidator,
    cartController.applyCouponToCart
  );

router
  .route("/:id")
  .put(
    authController.protect,
    authController.allowedTo("customer","seller"),
    cartValidator.updateProductQuantityInCartValidator,
    cartController.updateProductQuantityInCart
  )
  .delete(
    authController.protect,
    authController.allowedTo("customer","seller"),
    cartValidator.removeProductFromCartValidator,
    cartController.removeProductFromCart
  );
module.exports = router;
