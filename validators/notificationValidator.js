const { check } = require("express-validator");
const validatorMiddleware = require("../middleWares/validatorMiddleware");

const urlValidator = (value) => {
  if (!value) return true; // Allow empty
  return /^https?:\/\//.test(value);
};

const phoneValidator = (value) => {
  if (!value) return true; // Allow empty
  return /^\+?\d+$/.test(value);
};

const whatsappValidator = (value) => {
  if (!value) return true; // Allow empty
  return /^https?:\/\//.test(value) || /^\+?\d+$/.test(value); // URL or phone number
};

exports.updateNotificationPreferencesValidator = [
  check("general")
    .optional()
    .isBoolean()
    .withMessage("General preference must be a boolean"),

  check("special_offers")
    .optional()
    .isBoolean()
    .withMessage("Special offers preference must be a boolean"),

  check("promo_discounts")
    .optional()
    .isBoolean()
    .withMessage("Promo discounts preference must be a boolean"),

  check("payments")
    .optional()
    .isBoolean()
    .withMessage("Payments preference must be a boolean"),

  check("cashback")
    .optional()
    .isBoolean()
    .withMessage("Cashback preference must be a boolean"),

  check("app_updates")
    .optional()
    .isBoolean()
    .withMessage("App updates preference must be a boolean"),

  check("new_service")
    .optional()
    .isBoolean()
    .withMessage("New service preference must be a boolean"),

  validatorMiddleware,
];

exports.sendNotificationValidator = [
  check("type")
    .notEmpty()
    .withMessage("Notification type is required")
    .isIn(["general", "special_offers", "promo_discounts", "payments", "cashback", "app_updates", "new_service"])
    .withMessage("Invalid notification type"),

  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  check("body")
    .notEmpty()
    .withMessage("Body is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Body must be between 10 and 500 characters"),

  check("sendToAllUsers")
    .optional()
    .isBoolean()
    .withMessage("sendToAllUsers must be a boolean"),

  check("filterByRole")
    .optional()
    .isIn(["admin", "accountant", "seller", "customer", "affiliate", "delivery"])
    .withMessage("Invalid role filter"),

  check("userIds")
    .optional()
    .isArray()
    .withMessage("userIds must be an array"),

  check("userIds.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),

  validatorMiddleware,
];