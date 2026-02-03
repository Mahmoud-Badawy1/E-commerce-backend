const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    slot: {
      type: String,
      enum: ["banner1", "banner2", "banner3"],
      required: [true, "Banner slot is required"],
      unique: true,
    },
    type: {
      type: String,
      enum: ["structured", "html"],
      required: [true, "Banner type is required"],
    },
    image: {
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

bannerSchema.pre("save", function (next) {
  if (this.type === "structured") {
    if (!this.headline || !this.description || !this.ctaText) {
      return next(
        new Error("Structured banners require headline, description, and ctaText")
      );
    }
  } else if (this.type === "html") {
    if (!this.htmlContent) {
      return next(new Error("HTML banners require htmlContent"));
    }
  }
  next();
});

const bannerModel = mongoose.model("Banner", bannerSchema);

module.exports = bannerModel;
