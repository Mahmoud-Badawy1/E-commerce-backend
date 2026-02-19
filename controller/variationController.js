const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const productModel = require("../models/productModel");
const sellerModel = require("../models/sellerModel");

// @desc    Add variation to product
// @route   POST /products/:productId/variations
// @access  Seller
exports.addVariation = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { color, size, sku, price, discountPercentage, quantity, lowStockThreshold, image } = req.body;

  // Get seller
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Check if variation already exists
  const existingVariation = product.findVariation(color, size);
  if (existingVariation) {
    return next(new ApiError(`Variation ${color} - ${size} already exists`, 400));
  }

  // Add color and size to product's available options if not already present
  if (!product.colors.includes(color)) {
    product.colors.push(color);
  }
  if (!product.sizes.includes(size)) {
    product.sizes.push(size);
  }

  // Add variation
  product.variations.push({
    color,
    size,
    sku: sku || `${product.sku}-${color}-${size}`.toUpperCase(),
    price: price || product.price,
    discountPercentage: discountPercentage || product.discountPercentage,
    quantity: quantity || 0,
    lowStockThreshold: lowStockThreshold || 5,
    image: image || product.imageCover,
    isActive: true,
  });

  product.hasVariations = true;
  await product.save();

  res.status(201).json({
    status: "success",
    message: "Variation added successfully",
    data: product,
  });
});

// @desc    Get all variations for a product
// @route   GET /products/:productId/variations
// @access  Public
exports.getProductVariations = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId).select("variations colors sizes hasVariations");
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      hasVariations: product.hasVariations,
      colors: product.colors,
      sizes: product.sizes,
      variations: product.variations,
    },
  });
});

// @desc    Update variation
// @route   PUT /products/:productId/variations/:variationId
// @access  Seller
exports.updateVariation = asyncHandler(async (req, res, next) => {
  const { productId, variationId } = req.params;

  // Get seller
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Find variation
  const variation = product.variations.id(variationId);
  if (!variation) {
    return next(new ApiError("Variation not found", 404));
  }

  // Update variation fields
  const allowedUpdates = ["price", "discountPercentage", "quantity", "lowStockThreshold", "image", "isActive"];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      variation[field] = req.body[field];
    }
  });

  await product.save();

  res.status(200).json({
    status: "success",
    message: "Variation updated successfully",
    data: product,
  });
});

// @desc    Delete variation
// @route   DELETE /products/:productId/variations/:variationId
// @access  Seller
exports.deleteVariation = asyncHandler(async (req, res, next) => {
  const { productId, variationId } = req.params;

  // Get seller
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Find and remove variation
  const variation = product.variations.id(variationId);
  if (!variation) {
    return next(new ApiError("Variation not found", 404));
  }

  // Remove variation
  product.variations.pull(variationId);

  // Update hasVariations flag
  if (product.variations.length === 0) {
    product.hasVariations = false;
  }

  await product.save();

  res.status(200).json({
    status: "success",
    message: "Variation deleted successfully",
    data: null,
  });
});

// @desc    Adjust variation stock
// @route   PUT /products/:productId/variations/:variationId/adjust-stock
// @access  Seller
exports.adjustVariationStock = asyncHandler(async (req, res, next) => {
  const { productId, variationId } = req.params;
  const { quantity, type, notes } = req.body;

  // Get seller
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Find variation
  const variation = product.variations.id(variationId);
  if (!variation) {
    return next(new ApiError("Variation not found", 404));
  }

  // Adjust stock
  const oldQuantity = variation.quantity;
  variation.quantity = quantity;

  // Add to stock history
  product.addStockHistory(
    type || "adjustment",
    quantity - oldQuantity,
    null,
    notes || `Stock adjustment for variation: ${variation.color} - ${variation.size}`,
    req.user._id
  );

  await product.save();

  res.status(200).json({
    status: "success",
    message: "Variation stock adjusted successfully",
    data: {
      variation: {
        id: variation._id,
        color: variation.color,
        size: variation.size,
        oldQuantity,
        newQuantity: variation.quantity,
        availableStock: variation.quantity - variation.reservedStock,
      },
    },
  });
});

// @desc    Get low stock variations for seller
// @route   GET /products/variations/low-stock
// @access  Seller
exports.getLowStockVariations = asyncHandler(async (req, res, next) => {
  // Get seller
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Get all products for this seller
  const products = await productModel.find({ 
    seller: seller._id,
    hasVariations: true,
  }).select("title sku variations");

  // Collect low stock variations
  const lowStockVariations = [];
  products.forEach((product) => {
    const lowStockVars = product.getLowStockVariations();
    lowStockVars.forEach((variation) => {
      lowStockVariations.push({
        productId: product._id,
        productTitle: product.title,
        productSku: product.sku,
        variationId: variation._id,
        color: variation.color,
        size: variation.size,
        sku: variation.sku,
        quantity: variation.quantity,
        reservedStock: variation.reservedStock,
        availableStock: variation.quantity - variation.reservedStock,
        lowStockThreshold: variation.lowStockThreshold,
      });
    });
  });

  res.status(200).json({
    status: "success",
    results: lowStockVariations.length,
    data: lowStockVariations,
  });
});

// @desc    Bulk add variations to product
// @route   POST /products/:productId/variations/bulk
// @access  Seller
exports.bulkAddVariations = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { colors, sizes, defaultPrice, defaultQuantity, defaultLowStockThreshold } = req.body;

  // Get seller
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  if (!colors || !sizes || colors.length === 0 || sizes.length === 0) {
    return next(new ApiError("Colors and sizes arrays are required", 400));
  }

  // Generate variations for all combinations
  const addedVariations = [];
  const skippedVariations = [];

  colors.forEach((color) => {
    sizes.forEach((size) => {
      // Check if variation already exists
      const existingVariation = product.findVariation(color, size);
      if (existingVariation) {
        skippedVariations.push(`${color} - ${size}`);
        return;
      }

      // Add variation
      product.variations.push({
        color,
        size,
        sku: `${product.sku}-${color}-${size}`.toUpperCase(),
        price: defaultPrice || product.price,
        discountPercentage: product.discountPercentage,
        quantity: defaultQuantity || 0,
        lowStockThreshold: defaultLowStockThreshold || 5,
        image: product.imageCover,
        isActive: true,
      });

      addedVariations.push(`${color} - ${size}`);

      // Add to product's available options
      if (!product.colors.includes(color)) {
        product.colors.push(color);
      }
      if (!product.sizes.includes(size)) {
        product.sizes.push(size);
      }
    });
  });

  product.hasVariations = true;
  await product.save();

  res.status(201).json({
    status: "success",
    message: `${addedVariations.length} variations added successfully`,
    data: {
      added: addedVariations,
      skipped: skippedVariations,
      product,
    },
  });
});

// @desc    Check variation stock availability
// @route   GET /products/:productId/variations/check-stock
// @access  Public
exports.checkVariationStock = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { color, size, quantity } = req.query;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (!product.hasVariations) {
    return next(new ApiError("Product does not have variations", 400));
  }

  const variation = product.findVariation(color, size);
  if (!variation) {
    return next(new ApiError(`Variation ${color} - ${size} not found`, 404));
  }

  const availableStock = variation.quantity - variation.reservedStock;
  const requestedQuantity = parseInt(quantity) || 1;

  res.status(200).json({
    status: "success",
    data: {
      color: variation.color,
      size: variation.size,
      availableStock,
      requestedQuantity,
      inStock: availableStock >= requestedQuantity,
      isActive: variation.isActive,
      price: variation.priceAfterDiscount || variation.price,
    },
  });
});
