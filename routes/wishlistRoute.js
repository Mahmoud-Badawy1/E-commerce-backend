const express = require("express");
const wishlistController = require("../controller/wishlistController");

const router = express.Router();
const wishlistValidator = require("../validators/wishlistValidator");
const authController = require("../controller/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("customer", "seller"),
    wishlistController.getAllWishlists
  )
  .post(
    authController.protect,
    authController.allowedTo("customer", "seller"),
    wishlistValidator.addProductToWishlistValidator,
    wishlistController.addProductToWishlist
  );

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.allowedTo("customer", "seller"),
    wishlistValidator.removeProductFromWishlistValidator,
    wishlistController.removeProductFromWishlist
  );

module.exports = router;
