const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    slot: {
      type: String,
      enum: ["ad1", "ad2", "ad3", "ad4", "ad5", "sellerAd"],
      required: [true, "Ad slot is required"],
      unique: true,
    },
    type: {
      type: String,
      enum: ["structured", "html"],
      required: [true, "Ad type is required"],
    },
    background: {
      type: String,
    },
    headline: {
      type: String,
      maxlength: [100, "Headline too long"],
    },
    description: {
      type: String,
      maxlength: [500, "Description too long"],
    },
    ctaText: {
      type: String,
      maxlength: [50, "CTA text too long"],
    },
    ctaLink: {
      type: String,
    },
    htmlContent: {
      type: String,
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

adSchema.pre("save", function (next) {
  if (this.type === "structured") {
    if (!this.headline || !this.description || !this.ctaText) {
      return next(
        new Error("Structured ads require headline, description, and ctaText")
      );
    }
  } else if (this.type === "html") {
    if (!this.htmlContent) {
      return next(new Error("HTML ads require htmlContent"));
    }
  }
  next();
});

const adModel = mongoose.model("Ad", adSchema);

module.exports = adModel;
