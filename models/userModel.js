const dotenv = require("dotenv");

const bcrypt = require("bcryptjs");

dotenv.config({ path: "config.env" });

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "user name is required"],
      minlength: [3, "Too short User name"],
      maxlength: [30, "Too long User name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [5, "Password must be at least 5 character"],
    },
    changedPasswordAt: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetCodeExpiresAt: {
      type: Date,
    },
    passwordResetCodeVerified: {
      type: Boolean,
    },
    twoFactorCode: {
      type: Number,
    },
    twoFactorExpires: {
      type: Date,
    },
    phone: {
      type: String,
    },
    dob: {
      type: Date,
      validate: {
        validator: function(value) {
          // DOB should be in the past
          return !value || value < new Date();
        },
        message: 'Date of birth must be in the past'
      }
    },
    profileImage: {
      type: String,
    },
    avatar: {
      type: String, // Cloudinary URL for avatar
    },
    role: {
      type: String,
      enum: ["admin", "accountant", "seller", "customer", "affiliate", "delivery"],
      default: "customer",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    city: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        phone: String,
        details: String,
        country: String,
        city: String,
        postalCode: String,
      },
    ],
    googleId: {
      type: String,
    },
    notificationPreferences: {
      general: { type: Boolean, default: true },
      special_offers: { type: Boolean, default: true },
      promo_discounts: { type: Boolean, default: true },
      payments: { type: Boolean, default: false },
      cashback: { type: Boolean, default: false },
      app_updates: { type: Boolean, default: true },
      new_service: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// Add 2dsphere index for location
userSchema.index({ location: "2dsphere" });

const SetImageURL = (doc) => {
  if (doc.profileImage) {
    const imageURL = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = imageURL;
  }
  // Avatar is already a full Cloudinary URL, no need to modify
};

userSchema.post("init", (doc) => {
  SetImageURL(doc);
});

userSchema.post("save", (doc) => {
  SetImageURL(doc);
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
