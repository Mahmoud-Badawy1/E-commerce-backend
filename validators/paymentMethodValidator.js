const { check } = require("express-validator");
const validatorMiddleware = require("../middleWares/validatorMiddleware");

exports.addPaymentMethodValidator = [
  check("cardholderName")
    .notEmpty()
    .withMessage("Cardholder name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Cardholder name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Cardholder name must contain only letters"),

  check("last4")
    .notEmpty()
    .withMessage("Last 4 digits are required")
    .isLength({ min: 4, max: 4 })
    .withMessage("Last 4 digits must be exactly 4 characters")
    .isNumeric()
    .withMessage("Last 4 digits must be numeric"),

  check("brand")
    .notEmpty()
    .withMessage("Card brand is required")
    .isIn(["visa", "mastercard", "amex", "discover", "diners", "jcb"])
    .withMessage("Invalid card brand"),

  check("expiryMonth")
    .notEmpty()
    .withMessage("Expiry month is required")
    .isInt({ min: 1, max: 12 })
    .withMessage("Invalid expiry month"),

  check("expiryYear")
    .notEmpty()
    .withMessage("Expiry year is required")
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage("Invalid expiry year"),

  check("token")
    .notEmpty()
    .withMessage("Payment token is required")
    .isLength({ min: 10 })
    .withMessage("Invalid payment token"),

  check("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),

  validatorMiddleware,
];

exports.updatePaymentMethodValidator = [
  check("cardholderName")
    .notEmpty()
    .withMessage("Cardholder name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Cardholder name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Cardholder name must contain only letters"),

  validatorMiddleware,
];

exports.getPaymentMethodValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid payment method ID format"),

  validatorMiddleware,
];