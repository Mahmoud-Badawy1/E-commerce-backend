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
        size: {
          type: String,
        },
        price: {
          type: Number,
        },
        variationId: {
          type: mongoose.Schema.ObjectId,
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
      enum: ["pending", "Approved", "shipping", "completed", "delivered", "cancelled", "returned", "damaged"],
      default: "pending",
    },
    deliveryGuy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    deliveryStatus: {
      type: String,
      enum: ["unassigned", "assigned", "picked_up", "in_transit", "delivered"],
      default: "unassigned",
    },
    assignedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    deliveryNotes: {
      type: String,
      maxlength: [500, "Delivery notes too long"],
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
  }).populate({
    path: "deliveryGuy",
    select: "name phone avatar",
    match: { role: "delivery" },
  });
  next();
});

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
