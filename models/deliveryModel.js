const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },
    currentCity: {
      type: String,
      required: [true, "Current city is required"],
    },
    vehicleType: {
      type: String,
      enum: ["bike", "car", "scooter", "bicycle"],
      required: [true, "Vehicle type is required"],
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

deliverySchema.pre(/^find/, function (next) {
  this.populate({
    path: "userId",
    select: "name email phone profileImage avatar",
  });
  next();
});

const deliveryModel = mongoose.model("Delivery", deliverySchema);

module.exports = deliveryModel;