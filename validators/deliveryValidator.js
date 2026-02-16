const { check } = require("express-validator");
const validatorMiddleware = require("../middleWares/validatorMiddleware");

exports.createDeliveryProfileValidator = [
  check("currentCity")
    .notEmpty()
    .withMessage("Current city is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City name must be between 2 and 50 characters"),

  check("vehicleType")
    .notEmpty()
    .withMessage("Vehicle type is required")
    .isIn(["bike", "car", "scooter", "bicycle"])
    .withMessage("Invalid vehicle type"),

  check("licenseNumber")
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("License number must be between 3 and 50 characters"),

  validatorMiddleware,
];

exports.updateLocationValidator = [
  check("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  check("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  check("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City name must be between 2 and 50 characters"),

  validatorMiddleware,
];

exports.updateDeliveryStatusValidator = [
  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["available", "busy", "offline"])
    .withMessage("Invalid status"),

  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  check("deliveryStatus")
    .notEmpty()
    .withMessage("Delivery status is required")
    .isIn(["assigned", "picked_up", "in_transit", "delivered"])
    .withMessage("Invalid delivery status"),

  check("deliveryNotes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Delivery notes too long"),

  validatorMiddleware,
];