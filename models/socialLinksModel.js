const mongoose = require("mongoose");

const socialLinksSchema = new mongoose.Schema(
  {
    whatsapp: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\//.test(v) || /^\+?\d+$/.test(v); // URL or phone number
        },
        message: "WhatsApp must be a valid URL or phone number"
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^\+?\d+$/.test(v);
        },
        message: "Phone must contain only numbers and optional +"
      },
    },
    instagram: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\//.test(v);
        },
        message: "Instagram must be a valid URL"
      },
    },
    facebook: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\//.test(v);
        },
        message: "Facebook must be a valid URL"
      },
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\//.test(v);
        },
        message: "Twitter must be a valid URL"
      },
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\//.test(v);
        },
        message: "Website must be a valid URL"
      },
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const socialLinksModel = mongoose.model("SocialLinks", socialLinksSchema);

module.exports = socialLinksModel;