const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
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
        // Dynamic variation options (e.g., { "Color": "Black", "Storage": "128GB" })
        variationOptions: {
          type: Map,
          of: String,
        },
        price: {
          type: Number,
        },
        variationId: {
          type: mongoose.Schema.ObjectId,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    totalPrice: {
      type: Number,
    },
    totalPriceAfterDiscount: {
      type: Number,
    },
    paymobOrderId: {
      type: String,
      required: false,
      // unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const cartModel = mongoose.model("Cart", cartSchema);

module.exports = cartModel;
