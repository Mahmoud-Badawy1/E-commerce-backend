const axios = require("axios");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const sellerModel = require("../models/sellerModel");
const deliveryModel = require("../models/deliveryModel");
const ApiFeatures = require("../utils/apiFeatures");
const settingController = require("./settingController");

// Admin: Assign delivery guy to order
exports.assignDeliveryGuy = asyncHandler(async (req, res, next) => {
  const { orderId, deliveryGuyId } = req.body;

  // Verify delivery guy exists and has delivery role
  const deliveryGuy = await userModel.findOne({ 
    _id: deliveryGuyId, 
    role: "delivery" 
  });
  if (!deliveryGuy) {
    return next(new ApiError("Delivery guy not found or invalid role", 404));
  }

  // Check if delivery guy profile exists
  const deliveryProfile = await deliveryModel.findOne({ userId: deliveryGuyId });
  if (!deliveryProfile) {
    return next(new ApiError("Delivery profile not found", 404));
  }

  // Update order
  const order = await orderModel.findByIdAndUpdate(
    orderId,
    {
      deliveryGuy: deliveryGuyId,
      deliveryStatus: "assigned",
      assignedAt: new Date(),
      status: "shipping",
    },
    { new: true, runValidators: true }
  );

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Delivery guy assigned successfully",
    data: order,
  });
});

// Admin: Get all delivery guys
exports.getDeliveryGuys = asyncHandler(async (req, res, next) => {
  const filter = { role: "delivery", active: true };
  const users = await userModel.find(filter).select("name email phone avatar city");

  // Get their delivery profiles
  const userIds = users.map(user => user._id);
  const deliveryProfiles = await deliveryModel.find({ 
    userId: { $in: userIds } 
  }).sort({ totalDeliveries: -1 });

  // Combine user data with delivery data
  const deliveryGuys = users.map(user => {
    const profile = deliveryProfiles.find(p => p.userId._id.toString() === user._id.toString());
    return {
      ...user.toObject(),
      deliveryProfile: profile,
    };
  });

  res.status(200).json({
    status: "success",
    results: deliveryGuys.length,
    data: deliveryGuys,
  });
});

// Admin: Unassign delivery guy from order
exports.unassignDeliveryGuy = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findByIdAndUpdate(
    orderId,
    {
      deliveryGuy: null,
      deliveryStatus: "unassigned",
      assignedAt: null,
      status: "Approved",
    },
    { new: true, runValidators: true }
  );

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Delivery guy unassigned successfully",
    data: order,
  });
});

const mongoose = require("mongoose");
const controllerHandler = require("./controllerHandler");

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxes = await settingController.useSettings("taxes");
  const shipping = await settingController.useSettings("shipping");

  const cart = await cartModel.findById(req.params.id).populate('cartItems.product', 'seller');
  
  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }
  const cartPrice = cart.cartItems?.reduce((current, next)=>{
    return current + next.price
  }, 0)
    
  const totalOrderPrice = cartPrice + (cartPrice * taxes) / 100 + shipping;
  const order = await orderModel.create({
    customer: req.user._id,
    items: cart.cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      variationOptions: item.variationOptions,
      price: item.price,
      variationId: item.variationId,
      seller: item.product.seller
    })),
    cartPrice: cartPrice,
    taxes: (cartPrice * taxes) / 100,
    shipping: shipping,
    totalOrderPrice: totalOrderPrice,
    status: "pending",
  });
  if (order) {
    // Reserve stock for order items
    for (const item of cart.cartItems) {
      const product = await productModel.findById(item.product._id);
      
      if (!product) continue;
      
      if (product.hasVariations && item.variationOptions) {
        // Reserve stock for specific variation
        const variationOptions = Object.fromEntries(item.variationOptions);
        const variation = product.findVariation(variationOptions);
        if (variation) {
          const availableStock = variation.quantity - variation.reservedStock;
          if (availableStock < item.quantity) {
            // Rollback order if insufficient stock
            await orderModel.findByIdAndDelete(order._id);
            const optionsStr = JSON.stringify(variationOptions);
            throw new ApiError(`Insufficient stock for variation ${optionsStr}`, 400);
          }
          variation.reservedStock += item.quantity;
        }
      } else {
        // Reserve stock for main product
        const availableStock = product.quantity - product.reservedStock;
        if (availableStock < item.quantity) {
          // Rollback order if insufficient stock
          await orderModel.findByIdAndDelete(order._id);
          throw new ApiError(`Insufficient stock for ${product.title}`, 400);
        }
        product.reservedStock += item.quantity;
      }
      
      product.addStockHistory("reserved", item.quantity, order._id, "Stock reserved for cash order", req.user._id);
      await product.save();
    }
    
    await cartModel.findByIdAndDelete(req.params.id);
  }
  res.status(201).json({ message: "Order complete", data: order });
});

const createCreditOrder = async (paymentData) => {
  const paymobOrderId = paymentData.order.id;
  const email = paymentData.order.shipping_data.email;
  const address = paymentData.order.shipping_data;

  const cart = await cartModel.findOne({ paymobOrderId }).populate('cartItems.product', 'seller');
  if (!cart) throw new Error("❌ Cart not found for this Paymob order");

  const user = await userModel.findOne({ email });
  if (!user) throw new Error("❌ User not found for this email");

  const taxes = await settingController.useSettings("taxes");
  const shipping = await settingController.useSettings("shipping");

  const cartPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
  const totalOrderPrice = Number(paymentData.amount_cents) / 100;

  const shippingAddress = {
    details: address.street || "N/A",
    phone: address.phone_number || "N/A",
    city: address.city || "N/A",
    country: address.country || "N/A",
    postalCode: address.postal_code || "N/A",
  };

  const order = await orderModel.create({
    customer: user._id,
    shippingAddress,
    items: cart.cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      variationOptions: item.variationOptions,
      price: item.price,
      variationId: item.variationId,
      seller: item.product.seller
    })),
    cartPrice,
    taxes: (cartPrice * taxes) / 100,
    shipping,
    totalOrderPrice,
    status: "Approved",
    paymentMethod: "Paymob",
    isPaid: true,
    paidAt: Date.now(),
  });

  if (order) {
    // Update stock for each item (paid order - consume stock immediately)
    for (const item of cart.cartItems) {
      const product = await productModel.findById(item.product._id);
      
      if (!product) continue;
      
      if (product.hasVariations && item.variationOptions) {
        // Update specific variation stock
        const variationOptions = Object.fromEntries(item.variationOptions);
        const variation = product.findVariation(variationOptions);
        if (variation) {
          variation.quantity -= item.quantity;
        }
      } else {
        // Update main product stock
        product.quantity -= item.quantity;
      }
      
      product.sold += item.quantity;
      product.addStockHistory("sale", item.quantity, order._id, "Stock consumed for online payment order");
      await product.save();
    }
    
    await cartModel.findByIdAndDelete(cart._id);
  }
};

exports.checkOutSession = asyncHandler(async (req, res, next) => {
  const { PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID } =
    process.env;

  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new ApiError("No cart found for this user", 404));

  const taxPercentage = await settingController.useSettings("taxes");
  const shipping = await settingController.useSettings("shipping");
  const cartPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
  const taxes = Math.round(cartPrice * (taxPercentage / 100));
  const totalOrderPrice = Number(cartPrice) + Number(shipping) + Number(taxes);

  const address = (req.user.addresses && req.user.addresses[0]) || {};
  try {
    const authRes = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: PAYMOB_API_KEY,
      }
    );
    const token = authRes.data.token;

    const orderRes = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: (totalOrderPrice * 100).toString(),
        currency: "EGP",
        items: [],
      }
    );
    const orderId = orderRes.data.id;

    cart.paymobOrderId = orderId;
    await cart.save();

    const paymentKeyRes = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: (totalOrderPrice * 100).toString(),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: address.apartment || "N/A",
          email: req.user.email,
          floor: address.floor || "N/A",
          first_name: req.user.name?.split(" ")[0] || "User",
          street: address.details || "N/A",
          building: address.building || "N/A",
          phone_number: address.phone || "+201000000000",
          shipping_method: "PKG",
          postal_code: address.postalCode || "00000",
          city: address.city || "Cairo",
          country: address.country || "EG",
          last_name: req.user.name?.split(" ").slice(1).join(" ") || "Customer",
          state: address.city || "Cairo",
        },
        currency: "EGP",
        integration_id: PAYMOB_INTEGRATION_ID,
      }
    );

    const paymentToken = paymentKeyRes.data.token;
    const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
    res.status(200).json({ message: "success", data: { iframeURL } });
  } catch (err) {
    console.error("Paymob error:", err.response?.data || err.message);
    return next(new ApiError("Error in payment session", 500));
  }
});

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const event = req.body;

  if (
    event.type === "TRANSACTION" &&
    event.obj.success === true &&
    event.obj.order?.payment_status === "PAID"
  ) {
    const paymentData = event.obj;

    try {
      await createCreditOrder(paymentData);
    } catch (err) {
      console.error("❌ Failed to create order from Paymob webhook:", err);
      return res.status(500).send("Server Error");
    }
  } else if (event.type !== "TRANSACTION") {
  } else {
  }

  res.status(200).send("Received");
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id).populate('items.product');
  if (!order) {
    return next(new ApiError("No order found with this ID", 404));
  }
  
  const oldStatus = order.status;
  
  if (req.body.isPaid) {
    order.isPaid = true;
    order.paidAt = Date.now();
  }
  if (req.body.status == "delivered") {
    order.status = "delivered";
    order.deliveredAt = Date.now();
  }
  
  // Handle status changes and stock management
  if (req.body.status === "cancelled" && oldStatus !== "cancelled") {
    // Release reserved stock when order is cancelled
    for (const item of order.items) {
      const product = await productModel.findById(item.product._id);
      
      if (!product) continue;
      
      if (product.hasVariations && item.variationId) {
        // Release reserved stock for specific variation
        const variation = product.variations.id(item.variationId);
        if (variation && variation.reservedStock >= item.quantity) {
          variation.reservedStock -= item.quantity;
        }
      } else {
        // Release reserved stock for main product
        if (product.reservedStock >= item.quantity) {
          product.reservedStock -= item.quantity;
        }
      }
      
      product.addStockHistory("released", item.quantity, order._id, "Stock released due to order cancellation", req.user._id);
      await product.save();
    }
  }
  
  if (req.body.status === "delivered" && oldStatus !== "delivered") {
    // Consume reserved stock when order is delivered
    for (const item of order.items) {
      const product = await productModel.findById(item.product._id);
      
      if (!product) continue;
      
      if (product.hasVariations && item.variationId) {
        // Consume reserved stock for specific variation
        const variation = product.variations.id(item.variationId);
        if (variation && variation.reservedStock >= item.quantity) {
          variation.quantity -= item.quantity;
          variation.reservedStock -= item.quantity;
        }
      } else {
        // Consume reserved stock for main product
        if (product.reservedStock >= item.quantity) {
          product.quantity -= item.quantity;
          product.reservedStock -= item.quantity;
        }
      }
      
      product.sold += item.quantity;
      product.addStockHistory("sale", item.quantity, order._id, "Stock consumed on order delivery", req.user._id);
      await product.save();
    }
  }
  
  order.status = req.body.status || order.status;
  await order.save();
  res.json({ message: "Order updated successfully", data: order });
});

exports.filterOrderForUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role == "user") req.filterObject = { customer: req.user._id };
  next();
});

exports.getAllOrders = controllerHandler.getAll(orderModel);

exports.deleteOrder = controllerHandler.delete(orderModel);

// ========== Seller specific controllers ==========

// Helper to ensure order contains at least one product of this seller
const ensureSellerOwnsOrder = async (sellerId, order) => {
  if (!order) return false;
  const sellerProducts = await productModel
    .find({ seller: sellerId })
    .select("_id");
  const productIds = sellerProducts.map((p) => p._id.toString());
  const hasProduct = order.items.some((item) =>
    productIds.includes(item.product.toString())
  );
  return hasProduct;
};

// List orders for logged-in seller with filters and pagination
exports.getSellerOrders = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }
  
  // Build base match conditions using direct sellerId filter on items
  const matchConditions = {
    "items.seller": seller._id,  // Direct filter on sellerId in order items
  };

  // Status filter
  if (req.query.status && req.query.status !== "all") {
    matchConditions.status = req.query.status;
  }

  // Payment status filter
  if (req.query.paymentStatus && req.query.paymentStatus !== "all") {
    matchConditions.isPaid = req.query.paymentStatus === "paid";
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    matchConditions.createdAt = {};
    if (req.query.startDate) {
      matchConditions.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      matchConditions.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Count total documents
  const countPipeline = [
    { $match: matchConditions },
    { $count: "total" }
  ];
  const countResult = await orderModel.aggregate(countPipeline);
  const documentsCount = countResult[0]?.total || 0;

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortOptions = {};
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    sortOptions[sortBy] = 1;
  } else {
    sortOptions.createdAt = -1; // Default sort
  }

  // Fetch orders with populated products and filter items
  const orders = await orderModel.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    {
      $addFields: {
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                {
                  product: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDetails',
                          cond: { $eq: ['$$this._id', '$$item.product'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        productDetails: 0  // Remove temp field
      }
    },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: limit }
  ]);

  // Filter items to only seller's products and calculate totals
  const filteredOrders = orders.map((order) => {
    const sellerItems = order.items.filter((item) =>
      item.seller?.toString() === seller._id.toString()
    );

    const sellerCartPrice = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const sellerTaxes = order.cartPrice > 0 ? (sellerCartPrice * (order.taxes / order.cartPrice)) : 0;
    const sellerTotal = sellerCartPrice + sellerTaxes;

    return {
      ...order,
      items: sellerItems,
      sellerCartPrice,
      sellerTaxes,
      sellerTotal,
    };
  }).filter((order) => order.items.length > 0);

  // Counts by status
  const countsAggregation = await orderModel.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    all: documentsCount,
    pending: 0,
    Approved: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  countsAggregation.forEach((item) => {
    counts[item._id] = item.count;
  });

  const paginationResult = {
    currentPage: page,
    totalPages: Math.ceil(documentsCount / limit),
    totalItems: documentsCount,
    itemsPerPage: limit,
  };

  res.status(200).json({
    status: "success",
    results: filteredOrders.length,
    paginationResult,
    counts,
    data: filteredOrders,
  });
});

// Get single order for seller
exports.getSellerOrderDetails = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  // Fetch order with populated products
  const order = await orderModel.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    {
      $addFields: {
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                {
                  product: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDetails',
                          cond: { $eq: ['$$this._id', '$$item.product'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        productDetails: 0
      }
    }
  ]);

  if (!order || order.length === 0) {
    return next(new ApiError("No order found with this ID", 404));
  }

  const orderData = order[0];

  // Filter items to only seller's products
  const sellerItems = orderData.items.filter((item) =>
    item.seller?.toString() === seller._id.toString()
  );

  if (sellerItems.length === 0) {
    return next(new ApiError("You are not allowed to access this order", 403));
  }

  // Calculate seller-specific totals
  const sellerCartPrice = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const sellerTaxes = orderData.cartPrice > 0 ? (sellerCartPrice * (orderData.taxes / orderData.cartPrice)) : 0;
  const sellerTotal = sellerCartPrice + sellerTaxes;

  const filteredOrder = {
    ...orderData,
    items: sellerItems,
    sellerCartPrice,
    sellerTaxes,
    sellerTotal,
  };

  res.status(200).json({ status: "success", data: filteredOrder });
});

// Update order status/payment for seller
exports.updateSellerOrder = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("No order found with this ID", 404));
  }

  const ownsOrder = await ensureSellerOwnsOrder(seller._id, order);
  if (!ownsOrder) {
    return next(new ApiError("You are not allowed to update this order", 403));
  }

  if (typeof req.body.isPaid === "boolean") {
    order.isPaid = req.body.isPaid;
    order.paidAt = req.body.isPaid ? Date.now() : undefined;
  }

  const oldStatus = order.status;

  if (req.body.status) {
    const newStatus = req.body.status;
    
    // Handle stock management for status changes
    if (newStatus === "cancelled" && oldStatus !== "cancelled") {
      // Release reserved stock for seller's products when order is cancelled
      for (const item of order.items) {
        if (item.seller?.toString() !== seller._id.toString()) continue;
        
        const product = await productModel.findById(item.product);
        if (!product) continue;
        
        if (product.hasVariations && item.variationId) {
          const variation = product.variations.id(item.variationId);
          if (variation && variation.reservedStock >= item.quantity) {
            variation.reservedStock -= item.quantity;
          }
        } else {
          if (product.reservedStock >= item.quantity) {
            product.reservedStock -= item.quantity;
          }
        }
        
        product.addStockHistory("released", item.quantity, order._id, "Stock released by seller - order cancelled", req.user._id);
        await product.save();
      }
    }
    
    if ((newStatus === "completed" || newStatus === "delivered") && oldStatus !== "delivered" && oldStatus !== "completed") {
      // Consume reserved stock for seller's products when order is delivered/completed
      for (const item of order.items) {
        if (item.seller?.toString() !== seller._id.toString()) continue;
        
        const product = await productModel.findById(item.product);
        if (!product) continue;
        
        if (product.hasVariations && item.variationId) {
          const variation = product.variations.id(item.variationId);
          if (variation && variation.reservedStock >= item.quantity) {
            variation.quantity -= item.quantity;
            variation.reservedStock -= item.quantity;
          }
        } else {
          if (product.reservedStock >= item.quantity) {
            product.quantity -= item.quantity;
            product.reservedStock -= item.quantity;
          }
        }
        
        product.sold += item.quantity;
        product.addStockHistory("sale", item.quantity, order._id, "Stock consumed by seller - order completed", req.user._id);
        await product.save();
      }
    }
    
    order.status = newStatus;
    if (newStatus === "completed" || newStatus === "delivered") {
      order.deliveredAt = Date.now();
    }
  }

  if (req.body.paymentMethod) {
    order.paymentMethod = req.body.paymentMethod;
  }

  await order.save();

  res.status(200).json({
    status: "success",
    message: "Order updated successfully",
    data: order,
  });
});

// Delete order for seller (if business allows)
exports.deleteSellerOrder = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("No order found with this ID", 404));
  }

  const ownsOrder = await ensureSellerOwnsOrder(seller._id, order);
  if (!ownsOrder) {
    return next(new ApiError("You are not allowed to delete this order", 403));
  }

  await orderModel.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json({ status: "success", message: "Order deleted successfully" });
});

// Customer: Get delivery guy details for my order (only when order is in shipping/delivered)
exports.getMyOrderDeliveryDetails = asyncHandler(async (req, res, next) => {
  const order = await orderModel
    .findOne({ 
      _id: req.params.orderId, 
      customer: req.user._id, 
      status: { $in: ["shipping", "delivered"] },
      deliveryGuy: { $ne: null }
    })
    .populate({
      path: "deliveryGuy",
      select: "name phone avatar",
    });

  if (!order) {
    return next(new ApiError("Order not found or no delivery assigned yet", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      orderId: order._id,
      deliveryStatus: order.deliveryStatus,
      deliveryGuy: order.deliveryGuy,
      assignedAt: order.assignedAt,
      pickedUpAt: order.pickedUpAt,
      deliveredAt: order.deliveredAt,
      deliveryNotes: order.deliveryNotes,
    },
  });
});
