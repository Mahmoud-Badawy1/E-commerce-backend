const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const sellerModel = require("../models/sellerModel");
const salesTargetModel = require("../models/salesTargetModel");
const adModel = require("../models/adModel");
const bannerModel = require("../models/bannerModel");
const featuredProductModel = require("../models/featuredProductModel");
const mongoose = require("mongoose");

// ========== Seller Stats Functions ==========

// Get popular/most selling products for seller
exports.getSellerPopularProducts = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const limit = parseInt(req.query.limit) || 10;

  const popularProducts = await productModel
    .find({ seller: seller._id })
    .sort({ sold: -1 })
    .limit(limit)
    .select("title price priceAfterDiscount sold imageCover ratingsAverage");

  res.status(200).json({
    status: "success",
    results: popularProducts.length,
    data: popularProducts,
  });
});

// Get sales analytics (average sale value & items per sale)
exports.getSellerSalesAnalytics = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const period = req.query.period || "month";
  const now = new Date();
  let startDate;

  if (period === "day") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    return next(new ApiError("Invalid period. Use day, month, or year", 400));
  }

  const orders = await orderModel.aggregate([
    {
      $match: {
        "items.seller": seller._id,
        createdAt: { $gte: startDate },
        status: { $nin: ["cancelled"] },
      },
    },
    {
      $project: {
        items: {
          $filter: {
            input: "$items",
            cond: { $eq: ["$$this.seller", seller._id] },
          },
        },
        createdAt: 1,
      },
    },
  ]);

  let totalRevenue = 0;
  let totalItems = 0;
  const orderCount = orders.length;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      totalRevenue += item.price * item.quantity;
      totalItems += item.quantity;
    });
  });

  const averageSaleValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const averageItemsPerSale = orderCount > 0 ? totalItems / orderCount : 0;

  res.status(200).json({
    status: "success",
    data: {
      period,
      startDate,
      totalOrders: orderCount,
      totalRevenue,
      totalItems,
      averageSaleValue: Math.round(averageSaleValue * 100) / 100,
      averageItemsPerSale: Math.round(averageItemsPerSale * 100) / 100,
    },
  });
});

// Get customer growth stats
exports.getSellerCustomerGrowth = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const customers = await orderModel.aggregate([
    {
      $match: {
        "items.seller": seller._id,
      },
    },
    {
      $group: {
        _id: "$customer",
        firstPurchase: { $min: "$createdAt" },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$firstPurchase" },
          month: { $month: "$firstPurchase" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  const totalCustomers = await orderModel.distinct("customer", {
    "items.seller": seller._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      totalCustomers: totalCustomers.length,
      growthByMonth: customers,
    },
  });
});

// Get province stats
exports.getSellerProvinceStats = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const orders = await orderModel
    .find({ "items.seller": seller._id })
    .populate("customer", "addresses");

  const provinceStats = {};

  orders.forEach((order) => {
    if (order.customer && order.customer.addresses) {
      order.customer.addresses.forEach((address) => {
        const province = address.city || "Unknown";
        if (!provinceStats[province]) {
          provinceStats[province] = 0;
        }
        provinceStats[province]++;
      });
    }
  });

  const sortedProvinces = Object.entries(provinceStats)
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count);

  res.status(200).json({
    status: "success",
    data: {
      totalProvinces: sortedProvinces.length,
      provinces: sortedProvinces,
    },
  });
});

// Get seller dashboard stats
exports.getSellerDashboardStats = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const totalProducts = await productModel.countDocuments({
    seller: seller._id,
  });

  const orders = await orderModel.aggregate([
    {
      $match: {
        "items.seller": seller._id,
        status: { $nin: ["cancelled"] },
      },
    },
    {
      $project: {
        items: {
          $filter: {
            input: "$items",
            cond: { $eq: ["$$this.seller", seller._id] },
          },
        },
        customer: 1,
      },
    },
  ]);

  let totalRevenue = 0;
  const totalTransactions = orders.length;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      totalRevenue += item.price * item.quantity;
    });
  });

  const uniqueCustomers = await orderModel.distinct("customer", {
    "items.seller": seller._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      totalRevenue,
      totalCustomers: uniqueCustomers.length,
      totalTransactions,
      totalProducts,
    },
  });
});

// Set seller sales target
exports.setSellerSalesTarget = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const { targetAmount, period } = req.body;

  if (!targetAmount || !period) {
    return next(new ApiError("Target amount and period are required", 400));
  }

  const now = new Date();
  let startDate, endDate;

  if (period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === "yearly") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  } else {
    return next(new ApiError("Period must be monthly or yearly", 400));
  }

  await salesTargetModel.updateMany(
    { seller: seller._id, isActive: true },
    { isActive: false }
  );

  const salesTarget = await salesTargetModel.create({
    seller: seller._id,
    targetAmount,
    period,
    startDate,
    endDate,
    isActive: true,
  });

  res.status(201).json({
    status: "success",
    data: salesTarget,
  });
});

// Get seller sales target with progress
exports.getSellerSalesTarget = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const salesTarget = await salesTargetModel.findOne({
    seller: seller._id,
    isActive: true,
  });

  if (!salesTarget) {
    return res.status(200).json({
      status: "success",
      data: null,
      message: "No active sales target found",
    });
  }

  const orders = await orderModel.aggregate([
    {
      $match: {
        "items.seller": seller._id,
        createdAt: {
          $gte: salesTarget.startDate,
          $lte: salesTarget.endDate,
        },
        status: { $nin: ["cancelled"] },
      },
    },
    {
      $project: {
        items: {
          $filter: {
            input: "$items",
            cond: { $eq: ["$$this.seller", seller._id] },
          },
        },
      },
    },
  ]);

  let currentRevenue = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      currentRevenue += item.price * item.quantity;
    });
  });

  const progress = (currentRevenue / salesTarget.targetAmount) * 100;

  res.status(200).json({
    status: "success",
    data: {
      target: salesTarget,
      currentRevenue,
      progress: Math.round(progress * 100) / 100,
    },
  });
});

// Get seller dashboard ad
exports.getSellerAd = asyncHandler(async (req, res, next) => {
  const ad = await adModel.findOne({ slot: "sellerAd", isActive: true });

  res.status(200).json({
    status: "success",
    data: ad,
  });
});

// ========== Admin Stats Functions ==========

// Get popular products (by seller or all)
exports.getAdminPopularProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const sellerId = req.query.sellerId;

  const filter = sellerId ? { seller: sellerId } : {};

  const popularProducts = await productModel
    .find(filter)
    .sort({ sold: -1 })
    .limit(limit)
    .select("title price priceAfterDiscount sold imageCover ratingsAverage seller")
    .populate("seller", "firstName lastName");

  res.status(200).json({
    status: "success",
    results: popularProducts.length,
    data: popularProducts,
  });
});

// Get admin sales analytics
exports.getAdminSalesAnalytics = asyncHandler(async (req, res, next) => {
  const period = req.query.period || "month";
  const now = new Date();
  let startDate;

  if (period === "day") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    return next(new ApiError("Invalid period. Use day, month, or year", 400));
  }

  const orders = await orderModel.find({
    createdAt: { $gte: startDate },
    status: { $nin: ["cancelled"] },
  });

  let totalRevenue = 0;
  let totalItems = 0;
  const orderCount = orders.length;

  orders.forEach((order) => {
    totalRevenue += order.totalOrderPrice || 0;
    order.items.forEach((item) => {
      totalItems += item.quantity;
    });
  });

  const averageSaleValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const averageItemsPerSale = orderCount > 0 ? totalItems / orderCount : 0;

  res.status(200).json({
    status: "success",
    data: {
      period,
      startDate,
      totalOrders: orderCount,
      totalRevenue,
      totalItems,
      averageSaleValue: Math.round(averageSaleValue * 100) / 100,
      averageItemsPerSale: Math.round(averageItemsPerSale * 100) / 100,
    },
  });
});

// Get admin customer growth
exports.getAdminCustomerGrowth = asyncHandler(async (req, res, next) => {
  const customers = await orderModel.aggregate([
    {
      $group: {
        _id: "$customer",
        firstPurchase: { $min: "$createdAt" },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$firstPurchase" },
          month: { $month: "$firstPurchase" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  const totalCustomers = await orderModel.distinct("customer");

  res.status(200).json({
    status: "success",
    data: {
      totalCustomers: totalCustomers.length,
      growthByMonth: customers,
    },
  });
});

// Get admin province stats
exports.getAdminProvinceStats = asyncHandler(async (req, res, next) => {
  const orders = await orderModel.find().populate("customer", "addresses");

  const provinceStats = {};

  orders.forEach((order) => {
    if (order.customer && order.customer.addresses) {
      order.customer.addresses.forEach((address) => {
        const province = address.city || "Unknown";
        if (!provinceStats[province]) {
          provinceStats[province] = 0;
        }
        provinceStats[province]++;
      });
    }
  });

  const sortedProvinces = Object.entries(provinceStats)
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count);

  res.status(200).json({
    status: "success",
    data: {
      totalProvinces: sortedProvinces.length,
      provinces: sortedProvinces,
    },
  });
});

// Get admin dashboard stats
exports.getAdminDashboardStats = asyncHandler(async (req, res, next) => {
  const totalProducts = await productModel.countDocuments();

  const orders = await orderModel.find({
    status: { $nin: ["cancelled"] },
  });

  let totalRevenue = 0;
  const totalTransactions = orders.length;

  orders.forEach((order) => {
    totalRevenue += order.totalOrderPrice || 0;
  });

  const uniqueCustomers = await orderModel.distinct("customer");

  res.status(200).json({
    status: "success",
    data: {
      totalRevenue,
      totalCustomers: uniqueCustomers.length,
      totalTransactions,
      totalProducts,
    },
  });
});

// Get all sellers sales targets
exports.getAdminAllSalesTargets = asyncHandler(async (req, res, next) => {
  const salesTargets = await salesTargetModel
    .find({ isActive: true })
    .populate("seller", "firstName lastName email");

  const targetsWithProgress = await Promise.all(
    salesTargets.map(async (target) => {
      const orders = await orderModel.aggregate([
        {
          $match: {
            "items.seller": target.seller._id,
            createdAt: {
              $gte: target.startDate,
              $lte: target.endDate,
            },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $project: {
            items: {
              $filter: {
                input: "$items",
                cond: { $eq: ["$$this.seller", target.seller._id] },
              },
            },
          },
        },
      ]);

      let currentRevenue = 0;
      orders.forEach((order) => {
        order.items.forEach((item) => {
          currentRevenue += item.price * item.quantity;
        });
      });

      const progress = (currentRevenue / target.targetAmount) * 100;

      return {
        ...target.toObject(),
        currentRevenue,
        progress: Math.round(progress * 100) / 100,
      };
    })
  );

  res.status(200).json({
    status: "success",
    results: targetsWithProgress.length,
    data: targetsWithProgress,
  });
});

// Get best seller products
exports.getBestSellerProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const bestSellers = await productModel
    .find()
    .sort({ sold: -1 })
    .limit(limit)
    .select("title price priceAfterDiscount sold imageCover ratingsAverage");

  res.status(200).json({
    status: "success",
    results: bestSellers.length,
    data: bestSellers,
  });
});

// ========== Featured Products Functions ==========

// Get featured products
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const featured = await featuredProductModel.findOne().sort({ updatedAt: -1 });

  res.status(200).json({
    status: "success",
    data: featured,
  });
});

// Set featured products (admin only)
exports.setFeaturedProducts = asyncHandler(async (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length !== 9) {
    return next(new ApiError("You must provide exactly 9 product IDs", 400));
  }

  const existingProducts = await productModel.find({
    _id: { $in: products },
  });

  if (existingProducts.length !== 9) {
    return next(new ApiError("Some product IDs are invalid", 400));
  }

  const featured = await featuredProductModel.create({
    products,
    updatedBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: featured,
  });
});

// ========== Ads Management Functions ==========

// Get all ads
exports.getAds = asyncHandler(async (req, res, next) => {
  const ads = await adModel.find();

  res.status(200).json({
    status: "success",
    results: ads.length,
    data: ads,
  });
});

// Create ad
exports.createAd = asyncHandler(async (req, res, next) => {
  const ad = await adModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: ad,
  });
});

// Update ad
exports.updateAd = asyncHandler(async (req, res, next) => {
  const ad = await adModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!ad) {
    return next(new ApiError("Ad not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: ad,
  });
});

// Delete ad
exports.deleteAd = asyncHandler(async (req, res, next) => {
  const ad = await adModel.findByIdAndDelete(req.params.id);

  if (!ad) {
    return next(new ApiError("Ad not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Ad deleted successfully",
  });
});

// Get active ads (public)
exports.getActiveAds = asyncHandler(async (req, res, next) => {
  const ads = await adModel.find({ isActive: true });

  res.status(200).json({
    status: "success",
    results: ads.length,
    data: ads,
  });
});

// ========== Banners Management Functions ==========

// Get all banners
exports.getBanners = asyncHandler(async (req, res, next) => {
  const banners = await bannerModel.find();

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: banners,
  });
});

// Create banner
exports.createBanner = asyncHandler(async (req, res, next) => {
  const banner = await bannerModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: banner,
  });
});

// Update banner
exports.updateBanner = asyncHandler(async (req, res, next) => {
  const banner = await bannerModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!banner) {
    return next(new ApiError("Banner not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: banner,
  });
});

// Delete banner
exports.deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await bannerModel.findByIdAndDelete(req.params.id);

  if (!banner) {
    return next(new ApiError("Banner not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Banner deleted successfully",
  });
});

// Get active banners (public)
exports.getActiveBanners = asyncHandler(async (req, res, next) => {
  const banners = await bannerModel.find({ isActive: true });

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: banners,
  });
});
