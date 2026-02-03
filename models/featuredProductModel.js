const mongoose = require("mongoose");

const featuredProductSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Updated by admin is required"],
    },
  },
  {
    timestamps: true,
  }
);

featuredProductSchema.pre("save", function (next) {
  if (this.products.length !== 9) {
    return next(new Error("Featured products must contain exactly 9 products"));
  }
  next();
});

featuredProductSchema.pre(/^find/, function (next) {
  this.populate({
    path: "products",
    select: "title price priceAfterDiscount imageCover ratingsAverage sold",
  });
  next();
});

const featuredProductModel = mongoose.model("FeaturedProduct", featuredProductSchema);

module.exports = featuredProductModel;
