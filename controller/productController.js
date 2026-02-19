const controllerHandler = require("./controllerHandler");
const productModel = require("../models/productModel");
const sellerModel = require("../models/sellerModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const slugify = require("slugify");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Upload product images to Cloudinary
exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) {
    return next(new ApiError("Please upload product images", 400));
  }

  try {
    let imageCoverUrl = null;
    let imageUrls = [];

    // Upload cover image
    if (req.files.imageCover && req.files.imageCover[0]) {
      imageCoverUrl = await uploadToCloudinary.uploadSingle(
        req.files.imageCover[0].buffer, 
        "products", 
        800, 
        600
      );
    }

    // Upload additional images
    if (req.files.images && req.files.images.length > 0) {
      const imageBuffers = req.files.images.map(file => file.buffer);
      imageUrls = await uploadToCloudinary.uploadMultiple(
        imageBuffers, 
        "products", 
        800, 
        600
      );
    }

    res.status(200).json({
      status: "success",
      message: "Product images uploaded successfully",
      data: {
        imageCover: imageCoverUrl,
        images: imageUrls,
      },
    });
  } catch (error) {
    return next(new ApiError(`Image upload failed: ${error.message}`, 500));
  }
});

exports.createProduct = controllerHandler.create(productModel);

exports.getSpecificProduct = controllerHandler.getSpecific(productModel);

exports.getProducts = controllerHandler.getAll(productModel, "product");

exports.updateProduct = controllerHandler.update(productModel);

exports.deleteProduct = controllerHandler.delete(productModel);

// Seller-specific controllers
exports.getSellerProducts = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const filter = { seller: seller._id };
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
    data: products,
  });
});

exports.createSellerProduct = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  req.body.seller = seller._id;

  // Extract variation data if provided
  const { variationData, ...productData } = req.body;

  // Create the product
  const product = await productModel.create(productData);

  // If variation data is provided, add variations
  if (variationData) {
    // Check if bulk add (colors and sizes arrays)
    if (variationData.colors && variationData.sizes && Array.isArray(variationData.colors) && Array.isArray(variationData.sizes)) {
      const colors = variationData.colors;
      const sizes = variationData.sizes;
      const defaultPrice = variationData.defaultPrice || product.price;
      const defaultQuantity = variationData.defaultQuantity || 0;
      const defaultLowStockThreshold = variationData.defaultLowStockThreshold || 5;

      // Add colors and sizes to product
      product.colors = [...new Set([...product.colors, ...colors])];
      product.sizes = [...new Set([...product.sizes, ...sizes])];

      // Create all combinations
      const addedVariations = [];
      for (const color of colors) {
        for (const size of sizes) {
          // Check if variation already exists
          const existingVariation = product.variations.find(
            (v) => v.color === color && v.size === size
          );

          if (!existingVariation) {
            const sku = `${product.sku}-${color.toUpperCase().replace(/\s+/g, "-")}-${size.toUpperCase().replace(/\s+/g, "-")}`;
            
            product.variations.push({
              color,
              size,
              sku,
              price: defaultPrice,
              discountPercentage: product.discountPercentage || 0,
              quantity: defaultQuantity,
              lowStockThreshold: defaultLowStockThreshold,
              image: product.imageCover,
              isActive: true,
            });

            addedVariations.push(`${color} - ${size}`);
          }
        }
      }

      product.hasVariations = true;
      await product.save();

      return res.status(201).json({
        status: "success",
        message: `Product created with ${addedVariations.length} variations`,
        data: {
          product,
          addedVariations,
        },
      });
    }

    // Check if single variation add
    if (variationData.color && variationData.size) {
      const { color, size, sku, price, discountPercentage, quantity, lowStockThreshold, image } = variationData;

      // Check if variation already exists
      const existingVariation = product.variations.find(
        (v) => v.color === color && v.size === size
      );

      if (existingVariation) {
        return next(new ApiError(`Variation ${color} - ${size} already exists`, 400));
      }

      // Add color and size to product arrays
      if (!product.colors.includes(color)) {
        product.colors.push(color);
      }
      if (!product.sizes.includes(size)) {
        product.sizes.push(size);
      }

      // Generate SKU if not provided
      const variationSku = sku || `${product.sku}-${color.toUpperCase().replace(/\s+/g, "-")}-${size.toUpperCase().replace(/\s+/g, "-")}`;

      // Add variation
      product.variations.push({
        color,
        size,
        sku: variationSku,
        price: price || product.price,
        discountPercentage: discountPercentage !== undefined ? discountPercentage : product.discountPercentage,
        quantity: quantity || 0,
        lowStockThreshold: lowStockThreshold || 5,
        image: image || product.imageCover,
        isActive: true,
      });

      product.hasVariations = true;
      await product.save();

      return res.status(201).json({
        status: "success",
        message: "Product created with variation",
        data: product,
      });
    }
  }

  // No variations provided - return basic product
  res.status(201).json({ data: product });
});

exports.getSellerProduct = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const product = await productModel.findOne({
    _id: req.params.id,
    seller: seller._id,
  });

  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  res.status(200).json({ data: product });
});

exports.updateSellerProduct = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const product = await productModel.findOneAndUpdate(
    { _id: req.params.id, seller: seller._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  res.status(200).json({ data: product });
});

exports.deleteSellerProduct = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const product = await productModel.findOneAndDelete({
    _id: req.params.id,
    seller: seller._id,
  });

  if (!product) {
    return next(new ApiError("Product not found or not owned by you", 404));
  }

  res.status(200).json({ message: "Product deleted successfully" });
});

// Bulk import products from CSV
exports.bulkImportProducts = asyncHandler(async (req, res, next) => {
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }

  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return next(new ApiError("Products array is required and cannot be empty", 400));
  }

  const errors = [];
  const successCount = { count: 0 };
  const createdProducts = [];

  for (let i = 0; i < products.length; i++) {
    try {
      const product = products[i];
      if (!product.title || !product.description || !product.price || !product.quantity || !product.category || !product.imageCover) {
        errors.push({
          row: i + 2,
          error: "Missing required fields: title, description, price, quantity, category, imageCover",
        });
        continue;
      }
      
      // Auto-generate slug from title
      const slug = slugify(product.title, { lower: true });
      
      // Auto-generate SKU if not provided (format: SELLER_ID-TIMESTAMP-RANDOM)
      // Ensure uniqueness by checking existing SKU
      let sku = product.sku;
      if (!sku) {
        let uniqueSku = false;
        let attempt = 0;
        while (!uniqueSku && attempt < 5) {
          const generateSku = `${seller._id.toString().slice(-8)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const existingSku = await productModel.findOne({ sku: generateSku });
          if (!existingSku) {
            sku = generateSku;
            uniqueSku = true;
          }
          attempt++;
        }
        if (!sku) {
          // Fallback: use timestamp with high precision
          sku = `${seller._id.toString().slice(-8)}-${Date.now()}-${process.hrtime().toString()}`;
        }
      }
      
      const newProduct = await productModel.create({
        ...product,
        slug,
        sku,
        seller: seller._id,
        status: product.status || "published",
        variants: product.variants || [],
      });
      createdProducts.push(newProduct);
      successCount.count++;
    } catch (error) {
      errors.push({ row: i + 2, error: error.message });
    }
  }

  res.status(201).json({
    message: `Bulk import completed. ${successCount.count} products created successfully.`,
    data: {
      successCount: successCount.count,
      failureCount: errors.length,
      createdProducts,
      errors: errors.length > 0 ? errors : [],
    },
  });
});
