const { check } = require("express-validator");
const validatorMiddleware = require("../middleWares/validatorMiddleware");

exports.adjustStockValidator = [
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  check("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["add", "subtract"])
    .withMessage("Type must be 'add' or 'subtract'"),
  check("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string"),
  validatorMiddleware,
];

exports.setLowStockThresholdValidator = [
  check("threshold")
    .notEmpty()
    .withMessage("Threshold is required")
    .isInt({ min: 0 })
    .withMessage("Threshold must be a non-negative integer"),
  validatorMiddleware,
];

exports.updateProductPriceValidator = [
  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  check("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),
  check("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string"),
  validatorMiddleware,
];

exports.reserveStockValidator = [
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  validatorMiddleware,
];

exports.releaseStockValidator = [
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  validatorMiddleware,
];
