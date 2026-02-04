const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const sellerCustomerModel = require("../models/sellerCustomerModel");
const abandonedCartModel = require("../models/abandonedCartModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

// @desc    Create a new customer (link existing user or create new user + link)
// @route   POST /api/v1/customers
// @access  Private (Seller, Admin)
exports.createCustomer = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, streetAddress, country, state, notes } = req.body;

  // Determine the seller ID (admin can specify, seller uses their own)
  let sellerId = req.user._id;
  if (req.user.role === "admin" && req.body.sellerId) {
    sellerId = req.body.sellerId;
  }

  // Check if user with this email exists
  let user = await userModel.findOne({ email });

  if (!user) {
    // Create new user with role "customer"
    user = await userModel.create({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      role: "customer",
      active: true,
    });
  }

  // Check if this seller-customer relationship already exists
  const existingRelation = await sellerCustomerModel.findOne({
    userId: user._id,
    sellerId,
  });

  if (existingRelation) {
    return next(new ApiError("This customer is already linked to this seller", 400));
  }

  // Create the seller-customer relationship
  const sellerCustomer = await sellerCustomerModel.create({
    userId: user._id,
    sellerId,
    firstName,
    lastName,
    email,
    phone,
    streetAddress,
    country,
    state,
    notes,
  });

  res.status(201).json({ data: sellerCustomer, message: "Customer added successfully" });
});

// @desc    Get all customers (Seller: own, Admin: all)
// @route   GET /api/v1/customers
// @access  Private (Seller, Admin)
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  let filter = {};

  // Sellers see only their own customers
  if (req.user.role === "seller") {
    filter.sellerId = req.user._id;
  }

  // Admin can filter by sellerId if provided
  if (req.user.role === "admin" && req.query.sellerId) {
    filter.sellerId = req.query.sellerId;
  }

  const documentsCount = await sellerCustomerModel.countDocuments(filter);
  const apiFeatures = new ApiFeatures(sellerCustomerModel.find(filter), req.query)
    .filter()
    .limit()
    .paginate(documentsCount)
    .sort()
    .search("customer");

  const { mongooseQuery, paginationResult } = apiFeatures;
  const customers = await mongooseQuery;

  res.status(200).json({
    results: customers.length,
    paginationResult,
    data: customers,
  });
});

// @desc    Get specific customer
// @route   GET /api/v1/customers/:id
// @access  Private (Seller, Admin)
exports.getSpecificCustomer = asyncHandler(async (req, res, next) => {
  const customer = await sellerCustomerModel.findById(req.params.id);

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  // Sellers can only view their own customers
  if (req.user.role === "seller" && customer.sellerId.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not allowed to view this customer", 403));
  }

  res.status(200).json({ data: customer });
});

// @desc    Get customer details with stats
// @route   GET /api/v1/customers/:id/details
// @access  Private (Seller, Admin)
exports.getCustomerDetails = asyncHandler(async (req, res, next) => {
  const customer = await sellerCustomerModel.findById(req.params.id);

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  // Sellers can only view their own customers
  if (req.user.role === "seller" && customer.sellerId.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not allowed to view this customer", 403));
  }

  // Get orders for this customer from this seller
  const orders = await orderModel.find({
    customer: customer.userId._id || customer.userId,
    "items.seller": customer.sellerId,
  });

  // Calculate stats
  const stats = {
    totalOrders: 0,
    allOrdersCount: orders.length,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    returnedCount: 0,
    damagedCount: 0,
    shippingCount: 0,
    deliveredCount: 0,
  };

  orders.forEach((order) => {
    stats.totalOrders += order.totalOrderPrice || 0;

    switch (order.status) {
      case "pending":
        stats.pendingCount++;
        break;
      case "completed":
        stats.completedCount++;
        break;
      case "cancelled":
        stats.cancelledCount++;
        break;
      case "returned":
        stats.returnedCount++;
        break;
      case "damaged":
        stats.damagedCount++;
        break;
      case "shipping":
        stats.shippingCount++;
        break;
      case "delivered":
        stats.deliveredCount++;
        break;
    }
  });

  // Get abandoned cart count
  const abandonedCartCount = await abandonedCartModel.countDocuments({
    userId: customer.userId._id || customer.userId,
    sellerId: customer.sellerId,
    recovered: false,
  });

  res.status(200).json({
    data: customer,
    stats: {
      ...stats,
      abandonedCartCount,
    },
  });
});

// @desc    Get customer transaction history
// @route   GET /api/v1/customers/:id/transactions
// @access  Private (Seller, Admin)
exports.getCustomerTransactionHistory = asyncHandler(async (req, res, next) => {
  const customer = await sellerCustomerModel.findById(req.params.id);

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  // Sellers can only view their own customers
  if (req.user.role === "seller" && customer.sellerId.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not allowed to view this customer", 403));
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  // Get orders for this customer from this seller
  const orders = await orderModel
    .find({
      customer: customer.userId._id || customer.userId,
      "items.seller": customer.sellerId,
    })
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  const totalOrders = await orderModel.countDocuments({
    customer: customer.userId._id || customer.userId,
    "items.seller": customer.sellerId,
  });

  res.status(200).json({
    results: orders.length,
    paginationResult: {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(totalOrders / limit),
    },
    data: orders,
  });
});

// @desc    Update customer (Admin only)
// @route   PUT /api/v1/customers/:id
// @access  Private (Admin)
exports.updateCustomer = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone, streetAddress, country, state, notes } = req.body;

  const customer = await sellerCustomerModel.findByIdAndUpdate(
    req.params.id,
    {
      firstName,
      lastName,
      phone,
      streetAddress,
      country,
      state,
      notes,
    },
    { new: true, runValidators: true }
  );

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  res.status(200).json({ data: customer });
});

// @desc    Delete customer (Admin only - removes link, not the user)
// @route   DELETE /api/v1/customers/:id
// @access  Private (Admin)
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await sellerCustomerModel.findByIdAndDelete(req.params.id);

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  res.status(202).json({ msg: "Customer link removed successfully" });
});

// @desc    Record abandoned cart for customer
// @route   POST /api/v1/customers/:id/abandoned-cart
// @access  Private (Seller, Admin)
exports.recordAbandonedCart = asyncHandler(async (req, res, next) => {
  const customer = await sellerCustomerModel.findById(req.params.id);

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  // Sellers can only record for their own customers
  if (req.user.role === "seller" && customer.sellerId.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not allowed to record for this customer", 403));
  }

  const { cartItems, totalPrice } = req.body;

  const abandonedCart = await abandonedCartModel.create({
    userId: customer.userId._id || customer.userId,
    sellerId: customer.sellerId,
    cartItems,
    totalPrice,
  });

  res.status(201).json({ data: abandonedCart, message: "Abandoned cart recorded" });
});

// @desc    Get abandoned carts for customer
// @route   GET /api/v1/customers/:id/abandoned-carts
// @access  Private (Seller, Admin)
exports.getAbandonedCarts = asyncHandler(async (req, res, next) => {
  const customer = await sellerCustomerModel.findById(req.params.id);

  if (!customer) {
    return next(new ApiError(`No customer found for this id: ${req.params.id}`, 404));
  }

  // Sellers can only view their own customers
  if (req.user.role === "seller" && customer.sellerId.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not allowed to view this customer", 403));
  }

  const abandonedCarts = await abandonedCartModel.find({
    userId: customer.userId._id || customer.userId,
    sellerId: customer.sellerId,
    recovered: false,
  });

  res.status(200).json({ results: abandonedCarts.length, data: abandonedCarts });
});

// @desc    Mark abandoned cart as recovered
// @route   PUT /api/v1/customers/abandoned-cart/:cartId/recover
// @access  Private (Seller, Admin)
exports.recoverAbandonedCart = asyncHandler(async (req, res, next) => {
  const abandonedCart = await abandonedCartModel.findByIdAndUpdate(
    req.params.cartId,
    { recovered: true },
    { new: true }
  );

  if (!abandonedCart) {
    return next(new ApiError(`No abandoned cart found for this id: ${req.params.cartId}`, 404));
  }

  res.status(200).json({ data: abandonedCart, message: "Abandoned cart marked as recovered" });
});
