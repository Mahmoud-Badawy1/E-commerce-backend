const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    items: [
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
        price: {
          type: Number,
        },
        seller: {
          type: mongoose.Schema.ObjectId,
          ref: "Seller",
        },
      },
    ],
    cartPrice: {
      type: Number,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["cash on delivery", "online payment", "Paymob"],
      default: "cash on delivery",
      required: [true, "Payment method is required"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "Approved", "shipping", "completed", "delivered", "cancelled"],
      default: "pending",
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer",
    select: "name email addresses -_id",
  }).populate({
    path: "items.product",
    select: "title imageCover",
  });
  next();
});

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
