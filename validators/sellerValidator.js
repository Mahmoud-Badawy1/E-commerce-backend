const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const validatorMiddleWare = require("../middleWares/validatorMiddleware");
const asyncHandler = require("express-async-handler");

exports.createSellerProfileValidator = [
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
    .notEmpty()
    .withMessage("Phone is required")
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Please provide a valid phone number"),

  check("country")
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 2 })
    .withMessage("Please provide a valid country name"),

  check("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 3 })
    .withMessage("Address must be at least 3 characters"),

  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  check("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  validatorMiddleWare,
];

exports.updateSellerProfileValidator = [
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

  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  check("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  check("profileImage").optional(),

  validatorMiddleWare,
];

exports.updateContactDetailsValidator = [
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Mobile phone must be valid"),

  check("country").optional().isLength({ min: 2 }),

  check("address").optional().isLength({ min: 3 }),

  validatorMiddleWare,
];

exports.changeSellerPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .custom(
      asyncHandler(async (value, { req }) => {
        const user = await require("../models/userModel").findOne({
          _id: req.user._id,
        });
        if (!user) {
          return Promise.reject({
            message: "User not found",
            statusCode: 400,
          });
        }
        const isMatch = await bcrypt.compare(value, user.password);
        if (!isMatch) {
          return Promise.reject({
            message: "Current password is incorrect",
            statusCode: 400,
          });
        }
        return true;
      })
    ),

  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.newPasswordConfirm) {
        return Promise.reject({
          message: "Passwords do not match",
          statusCode: 400,
        });
      }
      return true;
    }),

  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  validatorMiddleWare,
];
