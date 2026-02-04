const { check, param } = require("express-validator");
const validatorMiddleWare = require("../middleWares/validatorMiddleware");

exports.createCustomerValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 30 })
    .withMessage("First name must be at most 30 characters"),

  check("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isLength({ max: 30 })
    .withMessage("Last name must be at most 30 characters"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Please provide a valid phone number"),

  check("streetAddress")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Street address must be at least 3 characters"),

  check("country")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Please provide a valid country name"),

  check("state")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Please provide a valid state name"),

  check("notes").optional(),

  check("sellerId")
    .optional()
    .isMongoId()
    .withMessage("Invalid seller ID format"),

  validatorMiddleWare,
];

exports.updateCustomerValidator = [
  param("id").isMongoId().withMessage("Invalid customer ID format"),

  check("firstName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 30 })
    .withMessage("First name must be at most 30 characters"),

  check("lastName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isLength({ max: 30 })
    .withMessage("Last name must be at most 30 characters"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Please provide a valid phone number"),

  check("streetAddress")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Street address must be at least 3 characters"),

  check("country")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Please provide a valid country name"),

  check("state")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Please provide a valid state name"),

  check("notes").optional(),

  validatorMiddleWare,
];

exports.getCustomerValidator = [
  param("id").isMongoId().withMessage("Invalid customer ID format"),
  validatorMiddleWare,
];

exports.abandonedCartValidator = [
  param("id").isMongoId().withMessage("Invalid customer ID format"),

  check("cartItems")
    .notEmpty()
    .withMessage("Cart items are required")
    .isArray()
    .withMessage("Cart items must be an array"),

  check("cartItems.*.product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID format"),

  check("cartItems.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  check("cartItems.*.price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number"),

  check("totalPrice")
    .notEmpty()
    .withMessage("Total price is required")
    .isNumeric()
    .withMessage("Total price must be a number"),

  validatorMiddleWare,
];

exports.recoverAbandonedCartValidator = [
  param("cartId").isMongoId().withMessage("Invalid abandoned cart ID format"),
  validatorMiddleWare,
];
