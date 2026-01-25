const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: "config.env" });

const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
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
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create Image URL
const SetImageURL = (doc) => {
  if (doc.profileImage) {
    const imageURL = `${process.env.BASE_URL}/sellers/${doc.profileImage}`;
    doc.profileImage = imageURL;
  }
};

sellerSchema.post("init", (doc) => {
  SetImageURL(doc);
});

sellerSchema.post("save", (doc) => {
  SetImageURL(doc);
});

const sellerModel = mongoose.model("Seller", sellerSchema);

module.exports = sellerModel;
