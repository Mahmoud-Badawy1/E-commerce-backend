const express = require("express");
const statsController = require("../controller/statsController");
const authController = require("../controller/authController");

const router = express.Router();

// ========== Public Routes ==========
router.get("/public/ads", statsController.getActiveAds);
router.get("/public/banners", statsController.getActiveBanners);
router.get("/public/featured-products", statsController.getFeaturedProducts);
router.get("/public/best-sellers", statsController.getBestSellerProducts);

// ========== Seller Routes ==========
router.use("/seller", authController.protect, authController.allowedTo("seller"));

router.get("/seller/popular-products", statsController.getSellerPopularProducts);
router.get("/seller/sales-analytics", statsController.getSellerSalesAnalytics);
router.get("/seller/customer-growth", statsController.getSellerCustomerGrowth);
router.get("/seller/province-stats", statsController.getSellerProvinceStats);
router.get("/seller/dashboard", statsController.getSellerDashboardStats);
router.get("/seller/sales-target", statsController.getSellerSalesTarget);
router.post("/seller/sales-target", statsController.setSellerSalesTarget);
router.get("/seller/ad", statsController.getSellerAd);

// ========== Admin Routes ==========
router.use("/admin", authController.protect, authController.allowedTo("admin"));

// Admin Stats
router.get("/admin/popular-products", statsController.getAdminPopularProducts);
router.get("/admin/sales-analytics", statsController.getAdminSalesAnalytics);
router.get("/admin/customer-growth", statsController.getAdminCustomerGrowth);
router.get("/admin/province-stats", statsController.getAdminProvinceStats);
router.get("/admin/dashboard", statsController.getAdminDashboardStats);
router.get("/admin/all-sales-targets", statsController.getAdminAllSalesTargets);
router.get("/admin/best-sellers", statsController.getBestSellerProducts);

// Featured Products
router.get("/admin/featured-products", statsController.getFeaturedProducts);
router.put("/admin/featured-products", statsController.setFeaturedProducts);

// Ads Management
router.get("/admin/ads", statsController.getAds);
router.post("/admin/ads", statsController.createAd);
router.put("/admin/ads/:id", statsController.updateAd);
router.delete("/admin/ads/:id", statsController.deleteAd);

// Banners Management
router.get("/admin/banners", statsController.getBanners);
router.post("/admin/banners", statsController.createBanner);
router.put("/admin/banners/:id", statsController.updateBanner);
router.delete("/admin/banners/:id", statsController.deleteBanner);

module.exports = router;
