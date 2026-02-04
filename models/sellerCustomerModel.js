const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const mongoose = require("mongoose");

// Auto-generate customer ID like "ID-011221"
const generateCustomerId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ID-${randomNum}`;
};

const sellerCustomerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      default: generateCustomerId,
    },
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
    // Additional customer info that seller can add
    firstName: {
      type: String,
      minlength: [2, "Too short first name"],
      maxlength: [30, "Too long first name"],
    },
    lastName: {
      type: String,
      minlength: [2, "Too short last name"],
      maxlength: [30, "Too long last name"],
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    streetAddress: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    // Tracking fields
    lastOnline: {
      type: Date,
    },
    lastTransaction: {
      type: Date,
    },
    // Seller's notes about the customer
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure unique seller-customer pair (one relationship per seller-customer)
sellerCustomerSchema.index({ userId: 1, sellerId: 1 }, { unique: true });

// Populate user data on find
sellerCustomerSchema.pre(/^find/, function (next) {
  this.populate({
    path: "userId",
    select: "name email phone profileImage addresses",
  });
  next();
});

const sellerCustomerModel = mongoose.model("SellerCustomer", sellerCustomerSchema);

module.exports = sellerCustomerModel;
