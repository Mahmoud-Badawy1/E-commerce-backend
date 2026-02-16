const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    cardholderName: {
      type: String,
      required: [true, "Cardholder name is required"],
      maxlength: [50, "Cardholder name too long"],
    },
    last4: {
      type: String,
      required: [true, "Last 4 digits are required"],
      length: [4, "Last 4 digits must be exactly 4 characters"],
      validate: {
        validator: function(v) {
          return /^\d{4}$/.test(v);
        },
        message: "Last 4 digits must contain only numbers"
      },
    },
    brand: {
      type: String,
      required: [true, "Card brand is required"],
      enum: ["visa", "mastercard", "amex", "discover", "diners", "jcb"],
      lowercase: true,
    },
    expiryMonth: {
      type: Number,
      required: [true, "Expiry month is required"],
      min: [1, "Invalid month"],
      max: [12, "Invalid month"],
    },
    expiryYear: {
      type: Number,
      required: [true, "Expiry year is required"],
      validate: {
        validator: function(v) {
          const currentYear = new Date().getFullYear();
          return v >= currentYear && v <= currentYear + 20;
        },
        message: "Invalid expiry year"
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      required: [true, "Payment token is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one default payment method per user
paymentMethodSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const paymentMethodModel = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = paymentMethodModel;