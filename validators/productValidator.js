const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../middleWares/validatorMiddleware");
const categoryModel = require("../models/categoryModel");
const productController = require("../controller/productController");
const productModel = require("../models/productModel");

exports.createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
    .custom((value, { req }) => {
      if (req.body.title) {
        req.body.slug = slugify(value);
      }
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("Too long price")
    .customSanitizer((value) => {
      return Math.ceil(value / 5) * 5;
    }),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .customSanitizer((value) => {
      return Math.ceil(value / 5) * 5;
    })
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        return Promise.reject({
          message: "Product price must be lower than original price",
          statusCode: 404,
        });
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors should be array of string"),
  check("sizes")
    .optional()
    .isArray()
    .withMessage("Sizes should be array of string"),
  check("sku")
    .notEmpty()
    .withMessage("Product SKU is required")
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage("SKU can only contain letters, numbers, dashes, and underscores")
    .custom(async (value) => {
      const existingProduct = await productModel.findOne({ sku: value.toUpperCase() });
      if (existingProduct) {
        return Promise.reject({
          message: `SKU already exists: ${value}`,
          statusCode: 400,
        });
      }
    }),

  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (categoryId) => {
      const categoryExists = await categoryModel.findById(categoryId);
      if (!categoryExists) {
        return Promise.reject({
          message: `No category found with this ID: ${categoryId}`,
          statusCode: 404,
        });
      }
    }),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .optional()
    .custom((value, { req }) => {
      if (req.body.title) {
        req.body.slug = slugify(value);
      }
      return true;
    }),
  check("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("Too long price")
    .customSanitizer((value) => {
      return Math.ceil(value / 5) * 5;
    }),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .customSanitizer((value) => {
      return Math.ceil(value / 5) * 5;
    })
    .custom(async (value, { req }) => {
      const product = await productModel.findById(req.params.id);
      if (
        req.body.priceAfterDiscount &&
        req.body.priceAfterDiscount >= product.price
      ) {
        return Promise.reject({
          message: `priceAfterDiscount cannot be greater than or equal to the original price ${product.price}`,
          statusCode: 404,
        });
      }
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors should be array of string"),
  check("sizes")
    .optional()
    .isArray()
    .withMessage("Sizes should be array of string"),
  check("sku")
    .optional()
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage("SKU can only contain letters, numbers, dashes, and underscores")
    .custom(async (value, { req }) => {
      const existingProduct = await productModel.findOne({ 
        sku: value.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return Promise.reject({
          message: `SKU already exists: ${value}`,
          statusCode: 400,
        });
      }
    }),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (categoryId) => {
      const categoryExists = await categoryModel.findById(categoryId);
      if (!categoryExists) {
        return Promise.reject({
          message: `No category found with this ID: ${categoryId}`,
          statusCode: 404,
        });
      }
    }),

  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];
