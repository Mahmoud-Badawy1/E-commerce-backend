const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "product title is required"],
      trim: true,
      minlength: [3, "Too short product name"],
      maxlength: [100, "Too long product name"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "product description is required"],
      minlength: [10, "Too short product description"],
      maxlength: [500, "Too long product description"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      trim: true,
      max: [250000, "Too long product Price"],
    },
    discountPercentage: {
      type: Number,
      trim: true,
      min: [0, "Too short product discountPercentage"],
      max: [100, "Too long product discountPercentage"],
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
      trim: true,
      max: [2000000, "Too long product PriceAfterDiscount"],
      default: 0,
    },
    colors: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "Image cover image is required"],
    },
    images: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to main category"],
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "Seller",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "rating must be above or equal 1"],
      max: [5, "rating must be below or equal 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

productSchema.pre("save", function (next) {
  if (this.price || this.discountPercentage) {
    const discounted = (this.priceAfterDiscount =
      this.price * (1 - this.discountPercentage / 100));
    this.priceAfterDiscount = Math.ceil(discounted);
  }
  next();
});

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name -_id",
  });
  this.populate({
    path: "reviews",
    select: "title -_id",
  });
  next();
});

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
