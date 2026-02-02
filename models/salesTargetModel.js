const mongoose = require("mongoose");

const salesTargetSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "Seller",
      required: [true, "Seller is required"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Target amount must be positive"],
    },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      required: [true, "Period is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

salesTargetSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

const salesTargetModel = mongoose.model("SalesTarget", salesTargetSchema);

module.exports = salesTargetModel;
