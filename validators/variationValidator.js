const { check } = require("express-validator");
const validatorMiddleware = require("../middleWares/validatorMiddleware");

// Validation for adding a single variation
exports.addVariationValidator = [
  check("options")
    .notEmpty()
    .withMessage("Options object is required (e.g., { 'Color': 'Red', 'Size': 'M' })")
    .isObject()
    .withMessage("Options must be an object")
    .custom((value) => {
      if (Object.keys(value).length === 0) {
        throw new Error("Options object cannot be empty");
      }
      return true;
    }),

  check("sku")
    .optional()
    .isString()
    .withMessage("SKU must be a string")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("SKU must be between 3 and 50 characters"),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price must be a positive number"),

  check("discountPercentage")
    .optional()
    .isNumeric()
    .withMessage("Discount percentage must be a number")
    .custom((value) => value >= 0 && value <= 100)
    .withMessage("Discount percentage must be between 0 and 100"),

  check("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer"),

  check("lowStockThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Low stock threshold must be a positive integer"),

  check("image")
    .optional()
    .isString()
    .withMessage("Image must be a string"),

  validatorMiddleware,
];

// Validation for bulk adding variations
exports.bulkAddVariationsValidator = [
  check("colors")
    .notEmpty()
    .withMessage("Colors array is required")
    .isArray({ min: 1 })
    .withMessage("Colors must be a non-empty array"),

  check("colors.*")
    .isString()
    .withMessage("Each color must be a string")
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Each color must be between 2 and 30 characters"),

  check("sizes")
    .notEmpty()
    .withMessage("Sizes array is required")
    .isArray({ min: 1 })
    .withMessage("Sizes must be a non-empty array"),

  check("sizes.*")
    .isString()
    .withMessage("Each size must be a string")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Each size must be between 1 and 20 characters"),

  check("defaultPrice")
    .optional()
    .isNumeric()
    .withMessage("Default price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Default price must be a positive number"),

  check("defaultQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Default quantity must be a positive integer"),

  check("defaultLowStockThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Default low stock threshold must be a positive integer"),

  validatorMiddleware,
];

// Validation for updating a variation
exports.updateVariationValidator = [
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price must be a positive number"),

  check("discountPercentage")
    .optional()
    .isNumeric()
    .withMessage("Discount percentage must be a number")
    .custom((value) => value >= 0 && value <= 100)
    .withMessage("Discount percentage must be between 0 and 100"),

  check("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer"),

  check("lowStockThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Low stock threshold must be a positive integer"),

  check("image")
    .optional()
    .isString()
    .withMessage("Image must be a string"),

  check("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  validatorMiddleware,
];

// Validation for adjusting variation stock
exports.adjustVariationStockValidator = [
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer"),

  check("type")
    .optional()
    .isIn(["purchase", "sale", "return", "adjustment", "reserved", "released"])
    .withMessage("Type must be one of: purchase, sale, return, adjustment, reserved, released"),

  check("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),

  validatorMiddleware,
];

// Validation for checking variation stock (Updated for dynamic options)
exports.checkVariationStockValidator = [
  check("variationOptions")
    .optional()
    .custom((value, { req }) => {
      // For GET requests, it comes as string
      if (req.method === 'GET' && typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('variationOptions must be valid JSON');
        }
      }
      // For POST requests, it should be an object
      if (req.method === 'POST' && typeof value !== 'object') {
        throw new Error('variationOptions must be an object');
      }
      return true;
    }),

  check("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  validatorMiddleware,
];

// Validation for generate combinations
exports.generateCombinationsValidator = [
  check("axes")
    .notEmpty()
    .withMessage("axes array is required")
    .isArray({ min: 1 })
    .withMessage("axes must be a non-empty array"),

  check("axes.*")
    .isString()
    .withMessage("Each axis must be a string"),

  check("combinations")
    .notEmpty()
    .withMessage("combinations object is required")
    .isObject()
    .withMessage("combinations must be an object"),

  check("defaultPrice")
    .notEmpty()
    .withMessage("defaultPrice is required")
    .isNumeric()
    .withMessage("defaultPrice must be a number")
    .custom((value) => value >= 0)
    .withMessage("defaultPrice must be a positive number"),

  check("defaultQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("defaultQuantity must be a positive integer"),

  check("priceVariations")
    .optional()
    .isObject()
    .withMessage("priceVariations must be an object"),

  check("discountPercentage")
    .optional()
    .isNumeric()
    .withMessage("discountPercentage must be a number")
    .custom((value) => value >= 0 && value <= 100)
    .withMessage("discountPercentage must be between 0 and 100"),

  validatorMiddleware,
];
