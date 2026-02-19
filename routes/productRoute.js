const express = require("express");
const productController = require("../controller/productController");
const variationController = require("../controller/variationController");
const uploadImageMiddleware = require("../middleWares/uploadImageMiddleware");

const router = express.Router();
const productValidator = require("../validators/productValidator");
const variationValidator = require("../validators/variationValidator");
const authController = require("../controller/authController");
const reviewRoute = require("./reviewRoute");

router.use("/:productId/reviews", reviewRoute);

// Product variations routes (public access)
router
  .route("/:productId/variations")
  .get(variationController.getProductVariations);

router
  .route("/:productId/variations/check-stock")
  .get(
    variationValidator.checkVariationStockValidator,
    variationController.checkVariationStock
  )
  .post(
    variationValidator.checkVariationStockValidator,
    variationController.checkVariationStock
  );

// Smart filtering: Get available options based on selection
router
  .route("/:productId/variations/available-options")
  .post(variationController.getAvailableOptions);

// Seller variation routes
router
  .route("/:productId/variations")
  .post(
    authController.protect,
    authController.allowedTo("seller"),
    variationValidator.addVariationValidator,
    variationController.addVariation
  );

router
  .route("/:productId/variations/bulk")
  .post(
    authController.protect,
    authController.allowedTo("seller"),
    variationValidator.bulkAddVariationsValidator,
    variationController.bulkAddVariations
  );

// Generate all combinations (Cartesian product)
router
  .route("/:productId/variations/generate-combinations")
  .post(
    authController.protect,
    authController.allowedTo("seller"),
    variationValidator.generateCombinationsValidator,
    variationController.generateCombinations
  );

router
  .route("/:productId/variations/:variationId")
  .put(
    authController.protect,
    authController.allowedTo("seller"),
    variationValidator.updateVariationValidator,
    variationController.updateVariation
  )
  .delete(
    authController.protect,
    authController.allowedTo("seller"),
    variationController.deleteVariation
  );

router
  .route("/:productId/variations/:variationId/adjust-stock")
  .put(
    authController.protect,
    authController.allowedTo("seller"),
    variationValidator.adjustVariationStockValidator,
    variationController.adjustVariationStock
  );

// Get low stock variations for seller
router
  .route("/variations/low-stock")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    variationController.getLowStockVariations
  );

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
