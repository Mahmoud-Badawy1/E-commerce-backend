const express = require("express");
const customerController = require("../controller/customerController");
const authController = require("../controller/authController");
const customerValidator = require("../validators/customerValidator");

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

// Create customer (Seller/Admin)
router.post(
  "/",
  authController.allowedTo("seller", "admin"),
  customerValidator.createCustomerValidator,
  customerController.createCustomer
);

// Get all customers (Seller: own, Admin: all)
router.get(
  "/",
  authController.allowedTo("seller", "admin"),
  customerController.getAllCustomers
);

// Recover abandoned cart
router.put(
  "/abandoned-cart/:cartId/recover",
  authController.allowedTo("seller", "admin"),
  customerValidator.recoverAbandonedCartValidator,
  customerController.recoverAbandonedCart
);

// Get specific customer
router.get(
  "/:id",
  authController.allowedTo("seller", "admin"),
  customerValidator.getCustomerValidator,
  customerController.getSpecificCustomer
);

// Get customer details with stats
router.get(
  "/:id/details",
  authController.allowedTo("seller", "admin"),
  customerValidator.getCustomerValidator,
  customerController.getCustomerDetails
);

// Get customer transaction history
router.get(
  "/:id/transactions",
  authController.allowedTo("seller", "admin"),
  customerValidator.getCustomerValidator,
  customerController.getCustomerTransactionHistory
);

// Get abandoned carts for customer
router.get(
  "/:id/abandoned-carts",
  authController.allowedTo("seller", "admin"),
  customerValidator.getCustomerValidator,
  customerController.getAbandonedCarts
);

// Record abandoned cart
router.post(
  "/:id/abandoned-cart",
  authController.allowedTo("seller", "admin"),
  customerValidator.abandonedCartValidator,
  customerController.recordAbandonedCart
);

// Update customer (Admin only)
router.put(
  "/:id",
  authController.allowedTo("admin"),
  customerValidator.updateCustomerValidator,
  customerController.updateCustomer
);

// Delete customer (Admin only - removes link, not the user)
router.delete(
  "/:id",
  authController.allowedTo("admin"),
  customerValidator.getCustomerValidator,
  customerController.deleteCustomer
);

module.exports = router;
