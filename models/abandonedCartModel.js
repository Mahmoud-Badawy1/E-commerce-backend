const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const mongoose = require("mongoose");

const abandonedCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Customer user ID is required"],
    },
    sellerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: {
          type: String,
        },
        size: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
    },
    abandonedAt: {
      type: Date,
      default: Date.now,
    },
    recovered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Populate product data on find
abandonedCartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cartItems.product",
    select: "title imageCover price",
  });
  next();
});

const abandonedCartModel = mongoose.model("AbandonedCart", abandonedCartSchema);

module.exports = abandonedCartModel;
