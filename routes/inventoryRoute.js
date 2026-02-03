const express = require("express");
const inventoryController = require("../controller/inventoryController");
const authController = require("../controller/authController");
const inventoryValidator = require("../validators/inventoryValidator");

const router = express.Router();

// All inventory routes require seller authentication
router.use(authController.protect, authController.allowedTo("seller"));

// Stock adjustment
router.post(
  "/:productId/adjust-stock",
  inventoryValidator.adjustStockValidator,
  inventoryController.adjustStock
);

// Set low stock threshold
router.put(
  "/:productId/low-stock-threshold",
  inventoryValidator.setLowStockThresholdValidator,
  inventoryController.setLowStockThreshold
);

// Get low stock products
router.get("/alerts/low-stock", inventoryController.getLowStockProducts);

// Get stock history for a product
router.get("/:productId/stock-history", inventoryController.getStockHistory);

// Get price history for a product
router.get("/:productId/price-history", inventoryController.getPriceHistory);

// Get inventory dashboard overview
router.get("/dashboard/overview", inventoryController.getInventoryDashboard);

// Update product price with history
router.put(
  "/:productId/price",
  inventoryValidator.updateProductPriceValidator,
  inventoryController.updateProductPrice
);

// Reserve stock (for order placement)
router.post(
  "/:productId/reserve",
  inventoryValidator.reserveStockValidator,
  inventoryController.reserveProductStock
);

// Release reserved stock (for order cancellation)
router.post(
  "/:productId/release",
  inventoryValidator.releaseStockValidator,
  inventoryController.releaseProductStock
);

module.exports = router;
