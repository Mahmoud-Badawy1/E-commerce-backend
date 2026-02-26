const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const productModel = require("../models/productModel");
const sellerModel = require("../models/sellerModel");
const findOrCreateSellerProfile = require("../utils/findOrCreateSellerProfile");

// Adjust stock (add or subtract)
exports.adjustStock = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity, type, reason } = req.body;

  const seller = await findOrCreateSellerProfile(req.user);

  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  if (type === "add") {
    product.quantity += quantity;
    product.addStockHistory("purchase", quantity, null, reason, req.user._id);
  } else if (type === "subtract") {
    if (product.quantity < quantity) {
      return next(new ApiError("Insufficient stock to subtract", 400));
    }
    product.quantity -= quantity;
    product.addStockHistory("adjustment", quantity, null, reason, req.user._id);
  } else {
    return next(new ApiError("Type must be 'add' or 'subtract'", 400));
  }

  await product.save();

  res.status(200).json({
    message: "Stock adjusted successfully",
    data: {
      productId: product._id,
      quantity: product.quantity,
      reservedStock: product.reservedStock,
      availableStock: product.availableStock,
      isLowStock: product.isLowStock,
    },
  });
});

// Set low stock threshold
exports.setLowStockThreshold = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { threshold } = req.body;

  if (threshold < 0) {
    return next(new ApiError("Threshold must be a positive number", 400));
  }

  const seller = await findOrCreateSellerProfile(req.user);

  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  product.lowStockThreshold = threshold;
  const availableStock = product.quantity - product.reservedStock;
  product.isLowStock = availableStock <= threshold;
  await product.save();

  res.status(200).json({
    message: "Low stock threshold updated",
    data: {
      productId: product._id,
      lowStockThreshold: product.lowStockThreshold,
      isLowStock: product.isLowStock,
      availableStock: product.availableStock,
    },
  });
});

// Get low stock products for a seller
exports.getLowStockProducts = asyncHandler(async (req, res, next) => {
  const seller = await findOrCreateSellerProfile(req.user);

  const filter = { seller: seller._id, isLowStock: true };
  const documentsCount = await productModel.countDocuments(filter);
  const apiFeatures = new ApiFeatures(productModel.find(filter), req.query)
    .filter()
    .limit()
    .paginate(documentsCount)
    .sort()
    .search("product");

  const { mongooseQuery, paginationResult } = apiFeatures;
  const products = await mongooseQuery;

  res.status(200).json({
    results: products.length,
    paginationResult,
    data: products.map((p) => ({
      _id: p._id,
      title: p.title,
      sku: p.sku,
      quantity: p.quantity,
      reservedStock: p.reservedStock,
      availableStock: p.availableStock,
      lowStockThreshold: p.lowStockThreshold,
    })),
  });
});

// Get stock history
exports.getStockHistory = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const seller = await findOrCreateSellerProfile(req.user);

  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Apply pagination to stock history
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const history = product.stockHistory.sort((a, b) => b.changedAt - a.changedAt);
  const paginatedHistory = history.slice(skip, skip + limit);

  res.status(200).json({
    results: paginatedHistory.length,
    pagination: {
      currentPage: page,
      limit,
      totalRecords: history.length,
      numberOfPages: Math.ceil(history.length / limit),
    },
    data: paginatedHistory,
  });
});

// Get price history
exports.getPriceHistory = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const seller = await findOrCreateSellerProfile(req.user);

  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Apply pagination to price history
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const history = product.priceHistory.sort((a, b) => b.changedAt - a.changedAt);
  const paginatedHistory = history.slice(skip, skip + limit);

  res.status(200).json({
    results: paginatedHistory.length,
    pagination: {
      currentPage: page,
      limit,
      totalRecords: history.length,
      numberOfPages: Math.ceil(history.length / limit),
    },
    data: paginatedHistory,
  });
});

// Get inventory dashboard (overview)
exports.getInventoryDashboard = asyncHandler(async (req, res, next) => {
  const seller = await findOrCreateSellerProfile(req.user);

  const products = await productModel.find({ seller: seller._id });

  let totalStock = 0;
  let totalReservedStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((p) => {
    totalStock += p.quantity;
    totalReservedStock += p.reservedStock;
    if (p.isLowStock) lowStockCount++;
    if (p.quantity === 0) outOfStockCount++;
  });

  const totalAvailableStock = totalStock - totalReservedStock;

  res.status(200).json({
    data: {
      totalProducts: products.length,
      totalStock,
      totalReservedStock,
      totalAvailableStock,
      lowStockCount,
      outOfStockCount,
      value: {
        description: "Total inventory value based on current prices",
        totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
        reservedValue: products.reduce((sum, p) => sum + p.price * p.reservedStock, 0),
        availableValue: products.reduce((sum, p) => sum + p.price * (p.quantity - p.reservedStock), 0),
      },
    },
  });
});

// Update product price with history
exports.updateProductPrice = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { price, discountPercentage, reason } = req.body;

  const seller = await findOrCreateSellerProfile(req.user);

  const product = await productModel.findOne({ _id: productId, seller: seller._id });
  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  // Store old price in history before updating
  if (product.price !== price || product.discountPercentage !== discountPercentage) {
    product.addPriceHistory(price, discountPercentage || 0, req.user._id, reason);
  }

  product.price = price;
  product.discountPercentage = discountPercentage || 0;

  await product.save();

  res.status(200).json({
    message: "Product price updated successfully",
    data: {
      productId: product._id,
      price: product.price,
      discountPercentage: product.discountPercentage,
      priceAfterDiscount: product.priceAfterDiscount,
    },
  });
});

// Reserve stock (for orders)
exports.reserveProductStock = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (product.availableStock < quantity) {
    return next(
      new ApiError(
        `Insufficient stock. Available: ${product.availableStock}, Requested: ${quantity}`,
        400
      )
    );
  }

  product.reservedStock += quantity;
  product.addStockHistory("reserved", quantity, null, "Stock reserved for order", req.user._id);
  await product.save();

  res.status(200).json({
    message: "Stock reserved successfully",
    data: {
      productId: product._id,
      reservedStock: product.reservedStock,
      availableStock: product.availableStock,
    },
  });
});

// Release reserved stock (when order is cancelled)
exports.releaseProductStock = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (product.reservedStock < quantity) {
    return next(
      new ApiError(
        `Cannot release more than reserved. Reserved: ${product.reservedStock}`,
        400
      )
    );
  }

  product.reservedStock -= quantity;
  product.addStockHistory("released", quantity, null, "Reserved stock released", req.user._id);
  await product.save();

  res.status(200).json({
    message: "Stock released successfully",
    data: {
      productId: product._id,
      reservedStock: product.reservedStock,
      availableStock: product.availableStock,
    },
  });
});
