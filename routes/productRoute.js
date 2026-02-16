const express = require("express");
const productController = require("../controller/productController");
const uploadImageMiddleware = require("../middleWares/uploadImageMiddleware");

const router = express.Router();
const productValidator = require("../validators/productValidator");
const authController = require("../controller/authController");
const reviewRoute = require("./reviewRoute");

router.use("/:productId/reviews", reviewRoute);

// Product image upload route
router
  .route("/upload-images")
  .post(
    authController.protect,
    authController.allowedTo("admin", "seller"),
    uploadImageMiddleware.uploadMultipleImage(),
    productController.uploadProductImages
  );

router
  .route("/")
  .get(productController.getProducts)
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    productValidator.createProductValidator,
    productController.createProduct
  );

// Seller-specific routes
router.use("/seller", authController.protect, authController.allowedTo("seller"));

router
  .route("/seller")
  .get(productController.getSellerProducts)
  .post(
    productValidator.createProductValidator,
    productController.createSellerProduct
  );

router
  .route("/seller/bulk-import")
  .post(productController.bulkImportProducts);

router
  .route("/seller/:id")
  .get(productController.getSellerProduct)
  .put(
    productValidator.updateProductValidator,
    productController.updateSellerProduct
  )
  .delete(productController.deleteSellerProduct);

router
  .route("/:id")
  .get(
    productValidator.getProductValidator,
    productController.getSpecificProduct
  )
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    productValidator.updateProductValidator,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    productValidator.deleteProductValidator,
    productController.deleteProduct
  );

module.exports = router;
