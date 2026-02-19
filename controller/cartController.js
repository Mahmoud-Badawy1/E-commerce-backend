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
  const { productId, color, size, variationId } = req.body;
  console.log("Adding product to cart",productId,color,size,variationId);
  
  const product = await productModel.findById(productId);
  console.log("Found product:",product);
  
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Validate variation stock if product has variations
  let itemPrice = product.priceAfterDiscount || product.price;
  let availableStock = product.quantity - product.reservedStock;
  
  if (product.hasVariations && color && size) {
    const variation = product.findVariation(color, size);
    if (!variation) {
      return next(new ApiError(`Variation ${color} - ${size} not found`, 404));
    }
    if (!variation.isActive) {
      return next(new ApiError(`Variation ${color} - ${size} is not available`, 400));
    }
    itemPrice = variation.priceAfterDiscount || variation.price;
    availableStock = variation.quantity - variation.reservedStock;
    
    if (availableStock < 1) {
      return next(new ApiError(`Variation ${color} - ${size} is out of stock`, 400));
    }
  } else if (availableStock < 1) {
    return next(new ApiError("Product is out of stock", 400));
  }
  
  let cart = await cartModel.findOne({ user: req.user._id });
  console.log("Current cart:",cart);

  if (!cart) {
    cart = await cartModel.create({
      user: req.user._id,
      cartItems: [{ 
        product: productId, 
        color: color, 
        size: size, 
        price: itemPrice,
        variationId: variationId
      }],
    });
    console.log("Created new cart:",cart);
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) => {
        if (variationId) {
          return item.variationId && item.variationId.toString() === variationId;
        }
        return item.product.toString() == productId && item.color == color && item.size == size;
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
      cart.cartItems.push({
        product: productId,
        color: color,
        size: size,
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
