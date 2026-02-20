/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");

const calculateCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalPrice = Math.ceil(totalPrice / 5) * 5;
  cart.totalPriceAfterDiscount = undefined;
};

exports.getAllProductsInCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: {
        cartItems: [],
        totalPrice: 0,
      },
    });
  }
  res.status(200).json({
    status: "success",
    results: cart.cartItems.length,
    data: cart,
  });
});

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, variationOptions, variationId } = req.body;
  console.log("Adding product to cart", productId, variationOptions, variationId);
  
  const product = await productModel.findById(productId);
  console.log("Found product:", product);
  
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Validate variation stock if product has variations
  let itemPrice = product.priceAfterDiscount || product.price;
  let availableStock = product.quantity - product.reservedStock;
  
  if (product.hasVariations && variationOptions) {
    const variation = product.findVariation(variationOptions);
    if (!variation) {
      const optionsStr = JSON.stringify(variationOptions);
      return next(new ApiError(`Variation ${optionsStr} not found`, 404));
    }
    if (!variation.isActive) {
      const optionsStr = JSON.stringify(variationOptions);
      return next(new ApiError(`Variation ${optionsStr} is not available`, 400));
    }
    itemPrice = variation.priceAfterDiscount || variation.price;
    availableStock = variation.quantity - variation.reservedStock;
    
    if (availableStock < 1) {
      const optionsStr = JSON.stringify(variationOptions);
      return next(new ApiError(`Variation ${optionsStr} is out of stock`, 400));
    }
  } else if (availableStock < 1) {
    return next(new ApiError("Product is out of stock", 400));
  }
  
  let cart = await cartModel.findOne({ user: req.user._id });
  console.log("Current cart:", cart);

  if (!cart) {
    // Convert variationOptions object to Map
    const optionsMap = variationOptions ? new Map(Object.entries(variationOptions)) : undefined;
    
    cart = await cartModel.create({
      user: req.user._id,
      cartItems: [{ 
        product: productId, 
        variationOptions: optionsMap,
        price: itemPrice,
        variationId: variationId
      }],
    });
    console.log("Created new cart:", cart);
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) => {
        if (variationId) {
          return item.variationId && item.variationId.toString() === variationId;
        }
        // Compare product and variation options
        if (item.product.toString() !== productId) {
          return false;
        }
        // If product has variations, compare options
        if (variationOptions && item.variationOptions) {
          const itemOptions = Object.fromEntries(item.variationOptions);
          return JSON.stringify(itemOptions) === JSON.stringify(variationOptions);
        }
        return !variationOptions && !item.variationOptions;
      }
    );
    
    if (productIndex >= 0) {
      const cartItem = cart.cartItems[productIndex];
      const newQuantity = cartItem.quantity + 1;
      
      // Check if new quantity exceeds available stock
      if (newQuantity > availableStock) {
        return next(new ApiError(`Only ${availableStock} items available in stock`, 400));
      }
      
      cartItem.quantity = newQuantity;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // Convert variationOptions object to Map
      const optionsMap = variationOptions ? new Map(Object.entries(variationOptions)) : undefined;
      
      cart.cartItems.push({
        product: productId,
        variationOptions: optionsMap,
        price: itemPrice,
        variationId: variationId
      });
    }
  }
  calculateCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    results: cart.cartItems.length,
    message: "Product added to cart",
    data: cart,
  });
});

exports.updateProductQuantityInCart = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await cartModel.findOneAndUpdate({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() == req.params.id
  );
  if (itemIndex > -1) {
    cart.cartItems[itemIndex].quantity = quantity;
    calculateCartPrice(cart);
    await cart.save();
    res.status(200).json({
      status: "success",
      results: cart.cartItems.length,
      message: "Product quantity updated",
      data: cart,
    });
  } else {
    return next(new ApiError("Product not found in cart", 404));
  }
});

exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.id } },
    },
    { new: true }
  );
  if (!cart) {
    return next(new ApiError(404, "No cart found for this user"));
  }
  calculateCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product removed from cart",
    data: cart,
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  await cartModel.findOneAndDelete({ user: req.user._id });
  res.status(202).json({
    status: "success",
    message: "cart cleared successfully",
  });
});

exports.applyCouponToCart = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const coupon = await couponModel.findOne({
    code: code,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError("Invalid or expired coupon code", 400));
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }
  const totalPrice = cart.totalPrice;
  const totalPriceAfterDiscount =
    Math.ceil((totalPrice * (1 - coupon.discount / 100)) / 5) * 5;
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: "success",
    results: cart.cartItems.length,
    message: "Coupon applied successfully",
    data: cart,
  });
});

exports.updateCartItemVariation = asyncHandler(async (req, res, next) => {
  const { variationOptions } = req.body;
  const { id } = req.params; // cart item id

  if (!variationOptions || typeof variationOptions !== 'object' || Object.keys(variationOptions).length === 0) {
    return next(new ApiError("variationOptions object is required", 400));
  }

  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("No cart found for this user", 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === id
  );

  if (itemIndex === -1) {
    return next(new ApiError("Product not found in cart", 404));
  }

  const cartItem = cart.cartItems[itemIndex];
  const product = await productModel.findById(cartItem.product);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (!product.hasVariations) {
    return next(new ApiError("This product does not have variations", 400));
  }

  // Find the new variation
  const newVariation = product.findVariation(variationOptions);
  if (!newVariation) {
    const optionsStr = JSON.stringify(variationOptions);
    return next(new ApiError(`Variation ${optionsStr} not found`, 404));
  }

  if (!newVariation.isActive) {
    const optionsStr = JSON.stringify(variationOptions);
    return next(new ApiError(`Variation ${optionsStr} is not available`, 400));
  }

  // Check if this new variation already exists in cart
  const duplicateIndex = cart.cartItems.findIndex(
    (item, idx) => {
      if (idx === itemIndex) return false; // Skip current item
      if (item.product.toString() !== cartItem.product.toString()) return false;
      if (!item.variationOptions) return false;
      
      const itemOptions = Object.fromEntries(item.variationOptions);
      return JSON.stringify(itemOptions) === JSON.stringify(variationOptions);
    }
  );

  if (duplicateIndex !== -1) {
    return next(new ApiError("This variation is already in your cart. Please update its quantity instead.", 400));
  }

  // Check stock availability for the requested quantity
  const availableStock = newVariation.quantity - newVariation.reservedStock;
  if (cartItem.quantity > availableStock) {
    return next(new ApiError(`Only ${availableStock} items available in stock for this variation`, 400));
  }

  // Update the cart item with new variation
  const optionsMap = new Map(Object.entries(variationOptions));
  cartItem.variationOptions = optionsMap;
  cartItem.price = newVariation.priceAfterDiscount || newVariation.price;

  cart.cartItems[itemIndex] = cartItem;
  calculateCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    results: cart.cartItems.length,
    message: "Product variation updated successfully",
    data: cart,
  });
});
