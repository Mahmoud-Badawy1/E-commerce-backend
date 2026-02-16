const { check } = require("express-validator");
const validatorMiddleware = require("../middleWares/validatorMiddleware");

exports.submitApplicationValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("First name must be between 2 and 30 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name must contain only letters"),

  check("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name must be between 2 and 30 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name must contain only letters"),

  check("businessName")
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),

  check("businessType")
    .notEmpty()
    .withMessage("Business type is required")
    .isIn(["individual", "company", "partnership"])
    .withMessage("Invalid business type"),

  check("businessCategory")
    .notEmpty()
    .withMessage("Business category is required")
    .isLength({ max: 50 })
    .withMessage("Business category too long"),

  check("businessDescription")
    .notEmpty()
    .withMessage("Business description is required")
    .isLength({ min: 50, max: 1000 })
    .withMessage("Business description must be between 50 and 1000 characters"),

  check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Invalid phone number format"),

  check("country")
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  check("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  check("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 200 })
    .withMessage("Address too long"),

  check("taxId")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Tax ID must be at least 5 characters"),

  check("website")
    .optional()
    .matches(/^https?:\/\//)
    .withMessage("Website must be a valid URL"),

  check("bankAccountInfo.accountHolderName")
    .notEmpty()
    .withMessage("Account holder name is required"),

  check("bankAccountInfo.bankName")
    .notEmpty()
    .withMessage("Bank name is required"),

  check("bankAccountInfo.accountNumber")
    .notEmpty()
    .withMessage("Account number is required"),

  check("bankAccountInfo.routingNumber")
    .optional(),

  validatorMiddleware,
];

exports.updateApplicationValidator = [
  check("firstName")
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage("First name must be between 2 and 30 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name must contain only letters"),

  check("lastName")
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name must be between 2 and 30 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name must contain only letters"),

  check("businessName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),

  check("businessType")
    .optional()
    .isIn(["individual", "company", "partnership"])
    .withMessage("Invalid business type"),

  check("businessCategory")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Business category too long"),

  check("businessDescription")
    .optional()
    .isLength({ min: 50, max: 1000 })
    .withMessage("Business description must be between 50 and 1000 characters"),

  validatorMiddleware,
];

exports.getApplicationValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid application ID format"),

  validatorMiddleware,
];

exports.approveApplicationValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid application ID format"),

  check("approvalReason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Approval reason too long"),

  validatorMiddleware,
];

exports.declineApplicationValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid application ID format"),

  check("declineReason")
    .notEmpty()
    .withMessage("Decline reason is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Decline reason must be between 10 and 500 characters"),

  validatorMiddleware,
];

exports.setUnderReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid application ID format"),

  check("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes too long"),

  validatorMiddleware,
];