const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const productModel = require("../models/productModel");

// @desc    Add variation to product
// @route   POST /products/:productId/variations
// @access  Seller
exports.addVariation = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { color, size, sku, price, discountPercentage, quantity, lowStockThreshold, image } = req.body;

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: req.user._id });
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

// @desc    Get all variations for a product (Enhanced with matrix)
// @route   GET /products/:productId/variations
// @access  Public
exports.getProductVariations = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId).select("variations hasVariations");
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Build available options by axis
  const availableOptionsByAxis = {};
  const matrix = {};

  if (product.hasVariations && product.variations.axes) {
    // Initialize axes
    product.variations.axes.forEach(axis => {
      availableOptionsByAxis[axis] = new Set();
    });

    // Collect all available options from active variations
    product.variations.items.forEach(item => {
      if (item.isActive && item.quantity > item.reservedStock) {
        item.options.forEach((value, key) => {
          if (availableOptionsByAxis[key]) {
            availableOptionsByAxis[key].add(value);
          }
        });
      }
    });

    // Convert Sets to Arrays
    Object.keys(availableOptionsByAxis).forEach(key => {
      availableOptionsByAxis[key] = Array.from(availableOptionsByAxis[key]);
    });

    // Build matrix (for first axis against others)
    if (product.variations.axes.length > 0) {
      const firstAxis = product.variations.axes[0];
      const firstAxisValues = availableOptionsByAxis[firstAxis] || [];

      firstAxisValues.forEach(value => {
        const availableSecondOptions = new Set();
        
        product.variations.items.forEach(item => {
          if (item.isActive && 
              item.quantity > item.reservedStock && 
              item.options.get(firstAxis) === value) {
            // Get other axis values
            item.options.forEach((optionValue, optionKey) => {
              if (optionKey !== firstAxis) {
                availableSecondOptions.add(optionValue);
              }
            });
          }
        });

        matrix[value] = Array.from(availableSecondOptions);
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      hasVariations: product.hasVariations,
      variations: {
        axes: product.variations.axes || [],
        availableOptionsByAxis,
        matrix,
        items: product.variations.items || [],
      },
    },
  });
});

// @desc    Update variation
// @route   PUT /products/:productId/variations/:variationId
// @access  Seller
exports.updateVariation = asyncHandler(async (req, res, next) => {
  const { productId, variationId } = req.params;

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: req.user._id });
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

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: req.user._id });
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

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: req.user._id });
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
  // Get all products for this seller
  const products = await productModel.find({ 
    seller: req.user._id,
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

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: req.user._id });
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

// @desc    Check variation stock availability (Updated for dynamic options)
// @route   GET /products/:productId/variations/check-stock
// @route   POST /products/:productId/variations/check-stock
// @access  Public
exports.checkVariationStock = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  
  // Support both GET (with JSON string) and POST (with object)
  let variationOptions;
  let quantity;
  
  if (req.method === 'GET') {
    try {
      variationOptions = req.query.variationOptions ? JSON.parse(req.query.variationOptions) : {};
      quantity = parseInt(req.query.quantity) || 1;
    } catch (error) {
      return next(new ApiError("Invalid variationOptions format. Must be valid JSON.", 400));
    }
  } else {
    variationOptions = req.body.variationOptions || {};
    quantity = req.body.quantity || 1;
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (!product.hasVariations) {
    return next(new ApiError("Product does not have variations", 400));
  }

  const variation = product.findVariation(variationOptions);
  if (!variation) {
    const optionsStr = JSON.stringify(variationOptions);
    return next(new ApiError(`Variation ${optionsStr} not found`, 404));
  }

  const availableStock = variation.quantity - variation.reservedStock;

  res.status(200).json({
    status: "success",
    data: {
      options: Object.fromEntries(variation.options),
      sku: variation.sku,
      availableStock,
      requestedQuantity: quantity,
      inStock: availableStock >= quantity,
      isActive: variation.isActive,
      price: variation.priceAfterDiscount || variation.price,
    },
  });
});

// @desc    Get available options based on selected options (Smart Filtering)
// @route   POST /products/:productId/variations/available-options
// @access  Public
exports.getAvailableOptions = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { selectedOptions } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (!product.hasVariations) {
    return next(new ApiError("Product does not have variations", 400));
  }

  const axes = product.variations.axes || [];
  const availableOptions = {};
  const matchingVariations = [];

  // Initialize all axes with empty sets
  axes.forEach(axis => {
    availableOptions[axis] = new Set();
  });

  // Filter variations based on selected options
  product.variations.items.forEach(item => {
    if (!item.isActive || item.quantity <= item.reservedStock) {
      return; // Skip inactive or out of stock
    }

    // Check if this variation matches all selected options
    let matches = true;
    if (selectedOptions) {
      for (const [key, value] of Object.entries(selectedOptions)) {
        if (item.options.get(key) !== value) {
          matches = false;
          break;
        }
      }
    }

    if (matches) {
      // Add this variation's options to available options
      item.options.forEach((value, key) => {
        availableOptions[key].add(value);
      });

      // Add to matching variations
      matchingVariations.push({
        _id: item._id,
        sku: item.sku,
        options: Object.fromEntries(item.options),
        price: item.price,
        priceAfterDiscount: item.priceAfterDiscount,
        discountPercentage: item.discountPercentage,
        quantity: item.quantity,
        reservedStock: item.reservedStock,
        availableStock: item.quantity - item.reservedStock,
        inStock: item.quantity > item.reservedStock,
        image: item.image,
      });
    }
  });

  // Convert Sets to Arrays
  Object.keys(availableOptions).forEach(key => {
    availableOptions[key] = Array.from(availableOptions[key]);
  });

  res.status(200).json({
    status: "success",
    data: {
      axes,
      selectedOptions: selectedOptions || {},
      availableOptions,
      matchingVariations,
      totalMatches: matchingVariations.length,
    },
  });
});

// @desc    Generate all combinations of variations (Bulk Creation)
// @route   POST /products/:productId/variations/generate-combinations
// @access  Seller
exports.generateCombinations = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { axes, combinations, defaultPrice, defaultQuantity, priceVariations, discountPercentage } = req.body;

  // Get product and verify ownership
  const product = await productModel.findOne({ _id: productId, seller: req.user._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Validate required fields
  if (!axes || !Array.isArray(axes) || axes.length === 0) {
    return next(new ApiError("axes array is required", 400));
  }

  if (!combinations || typeof combinations !== 'object') {
    return next(new ApiError("combinations object is required", 400));
  }

  if (!defaultPrice) {
    return next(new ApiError("defaultPrice is required", 400));
  }

  // Generate all combinations using Cartesian product
  const generateCombinations = (obj) => {
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    
    const cartesian = (...arrays) => {
      return arrays.reduce((acc, array) => {
        return acc.flatMap(x => array.map(y => [...x, y]));
      }, [[]]);
    };
    
    const combos = cartesian(...values);
    return combos.map(combo => {
      const result = {};
      keys.forEach((key, i) => {
        result[key] = combo[i];
      });
      return result;
    });
  };

  const allCombinations = generateCombinations(combinations);
  const addedVariations = [];
  const skippedVariations = [];
  const matrix = {};

  for (const optionsObj of allCombinations) {
    // Check if already exists
    const existing = product.findVariation(optionsObj);
    if (existing) {
      const displayStr = Object.entries(optionsObj)
        .map(([k, v]) => `${v}`)
        .join(" - ");
      skippedVariations.push(displayStr);
      continue;
    }

    // Calculate price (check if there's override)
    let price = defaultPrice;
    for (const [key, value] of Object.entries(optionsObj)) {
      if (priceVariations && priceVariations[value]) {
        price = priceVariations[value];
        break;
      }
    }

    // Generate SKU
    const sku = `${product.sku}-${Object.values(optionsObj).join("-").toUpperCase().replace(/\s+/g, "-")}`;

    // Add variation
    product.variations.items.push({
      sku,
      options: new Map(Object.entries(optionsObj)),
      price,
      discountPercentage: discountPercentage || 0,
      quantity: defaultQuantity || 0,
      lowStockThreshold: 5,
      image: product.imageCover,
      isActive: true
    });

    const displayStr = Object.entries(optionsObj)
      .map(([k, v]) => `${v}`)
      .join(" - ");
    addedVariations.push(displayStr);

    // Build matrix for first axis
    if (axes.length > 0) {
      const firstAxisKey = axes[0];
      const firstAxisValue = optionsObj[firstAxisKey];
      
      if (!matrix[firstAxisValue]) {
        matrix[firstAxisValue] = [];
      }
      
      // Add other axis values
      Object.entries(optionsObj).forEach(([key, value]) => {
        if (key !== firstAxisKey && !matrix[firstAxisValue].includes(value)) {
          matrix[firstAxisValue].push(value);
        }
      });
    }
  }

  product.hasVariations = true;
  product.variations.axes = axes;
  await product.save();

  res.status(201).json({
    status: "success",
    message: `${addedVariations.length} variations generated successfully`,
    data: {
      generated: addedVariations.length,
      skipped: skippedVariations.length,
      addedVariations,
      skippedVariations,
      matrix,
      product,
    },
  });
});
