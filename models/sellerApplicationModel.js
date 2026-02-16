const mongoose = require("mongoose");

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "Too short first name"],
      maxlength: [30, "Too long first name"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Too short last name"], 
      maxlength: [30, "Too long last name"],
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      minlength: [2, "Too short business name"],
      maxlength: [100, "Too long business name"],
    },
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: ["individual", "company", "partnership"],
    },
    businessCategory: {
      type: String,
      required: [true, "Business category is required"],
      maxlength: [50, "Business category too long"],
    },
    businessDescription: {
      type: String,
      required: [true, "Business description is required"],
      minlength: [50, "Business description too short"],
      maxlength: [1000, "Business description too long"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      maxlength: [200, "Address too long"],
    },
    taxId: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || v.length >= 5; // Optional but if provided, must be at least 5 chars
        },
        message: "Tax ID must be at least 5 characters"
      },
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^https?:\/\//.test(v);
        },
        message: "Website must be a valid URL"
      },
    },
    bankAccountInfo: {
      accountHolderName: {
        type: String,
        required: [true, "Account holder name is required"],
      },
      bankName: {
        type: String,
        required: [true, "Bank name is required"],
      },
      accountNumber: {
        type: String,
        required: [true, "Account number is required"],
      },
      routingNumber: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "under_review"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    approvalReason: {
      type: String,
      maxlength: [500, "Approval reason too long"],
    },
    declineReason: {
      type: String,
      maxlength: [500, "Decline reason too long"],
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes too long"],
    },
  },
  {
    timestamps: true,
  }
);

// Populate user details when querying 
sellerApplicationSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email avatar phone",
  }).populate({
    path: "reviewedBy", 
    select: "name email",
  });
  next();
});

const sellerApplicationModel = mongoose.model("SellerApplication", sellerApplicationSchema);

module.exports = sellerApplicationModel;