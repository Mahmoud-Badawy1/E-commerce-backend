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
    sku: {
      type: String,
      sparse: true,
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
    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
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
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    // Product has variations (colors, sizes, etc.)
    hasVariations: {
      type: Boolean,
      default: false,
    },
    // Available colors for this product
    colors: {
      type: [String],
      default: [],
    },
    // Available sizes for this product
    sizes: {
      type: [String],
      default: [],
    },
    // Variations with stock tracking
    variations: [
      {
        color: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        sku: {
          type: String,
          required: true,
          trim: true,
          uppercase: true,
        },
        price: {
          type: Number,
        },
        discountPercentage: {
          type: Number,
          min: [0, "Discount cannot be negative"],
          max: [100, "Discount cannot exceed 100%"],
          default: 0,
        },
        priceAfterDiscount: {
          type: Number,
        },
        quantity: {
          type: Number,
          required: [true, "Variation quantity is required"],
          min: [0, "Quantity cannot be negative"],
          default: 0,
        },
        reservedStock: {
          type: Number,
          default: 0,
          min: [0, "Reserved stock cannot be negative"],
        },
        lowStockThreshold: {
          type: Number,
          default: 5,
          min: [0, "Low stock threshold cannot be negative"],
        },
        isLowStock: {
          type: Boolean,
          default: false,
        },
        image: {
          type: String,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    // Inventory Management
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
    // Price History
    priceHistory: [
      {
        price: {
          type: Number,
          required: true,
        },
        discountPercentage: {
          type: Number,
          default: 0,
        },
        priceAfterDiscount: {
          type: Number,
        },
        changedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
    // Stock History
    stockHistory: [
      {
        type: {
          type: String,
          enum: ["purchase", "sale", "return", "adjustment", "reserved", "released"],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        orderId: mongoose.Schema.ObjectId,
        reference: String,
        notes: String,
        changedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

productSchema.pre("save", function (next) {
  // Calculate price after discount for main product
  if (this.price || this.discountPercentage) {
    const discounted = (this.priceAfterDiscount =
      this.price * (1 - this.discountPercentage / 100));
    this.priceAfterDiscount = Math.ceil(discounted);
  }
  
  // Calculate price after discount for each variation
  if (this.variations && this.variations.length > 0) {
    this.variations.forEach((variation) => {
      const varPrice = variation.price || this.price;
      const varDiscount = variation.discountPercentage || this.discountPercentage || 0;
      const discounted = varPrice * (1 - varDiscount / 100);
      variation.priceAfterDiscount = Math.ceil(discounted);
      
      // Check if variation stock is low
      const availableStock = variation.quantity - variation.reservedStock;
      variation.isLowStock = availableStock <= variation.lowStockThreshold;
    });
  }
  
  // Check if main product stock is low
  const availableStock = this.quantity - this.reservedStock;
  this.isLowStock = availableStock <= this.lowStockThreshold;
  next();
});

// Virtual for available stock
productSchema.virtual("availableStock").get(function () {
  return Math.max(0, this.quantity - this.reservedStock);
});

// Method to add price history entry
productSchema.methods.addPriceHistory = function (price, discountPercentage, changedBy, reason) {
  const priceAfterDiscount = price * (1 - discountPercentage / 100);
  this.priceHistory.push({
    price,
    discountPercentage,
    priceAfterDiscount: Math.ceil(priceAfterDiscount),
    changedBy,
    reason,
  });
  return this;
};

// Method to add stock history entry
productSchema.methods.addStockHistory = function (type, quantity, orderId, notes, changedBy) {
  this.stockHistory.push({
    type,
    quantity,
    orderId,
    notes,
    changedBy,
  });
  return this;
};

// Method to reserve stock
productSchema.methods.reserveStock = function (quantity) {
  if (this.availableStock < quantity) {
    throw new Error(`Insufficient stock. Available: ${this.availableStock}`);
  }
  this.reservedStock += quantity;
  this.addStockHistory("reserved", quantity, null, "Stock reserved for order");
  return this;
};

// Method to release reserved stock
productSchema.methods.releaseStock = function (quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  this.addStockHistory("released", quantity, null, "Reserved stock released");
  return this;
};

// Method to consume stock (reduce quantity and reserved)
productSchema.methods.consumeStock = function (quantity, orderId) {
  if (this.reservedStock < quantity) {
    throw new Error(`Insufficient reserved stock`);
  }
  this.quantity -= quantity;
  this.reservedStock -= quantity;
  this.addStockHistory("sale", quantity, orderId, "Stock consumed for order fulfillment");
  return this;
};

// Method to find a variation by color and size
productSchema.methods.findVariation = function (color, size) {
  if (!this.variations || this.variations.length === 0) {
    return null;
  }
  return this.variations.find(
    (v) => v.color.toLowerCase() === color.toLowerCase() && 
           v.size.toLowerCase() === size.toLowerCase()
  );
};

// Method to get available stock for a variation
productSchema.methods.getVariationAvailableStock = function (color, size) {
  const variation = this.findVariation(color, size);
  if (!variation) {
    throw new Error(`Variation not found: ${color} - ${size}`);
  }
  return Math.max(0, variation.quantity - variation.reservedStock);
};

// Method to reserve stock for a variation
productSchema.methods.reserveVariationStock = function (color, size, quantity) {
  const variation = this.findVariation(color, size);
  if (!variation) {
    throw new Error(`Variation not found: ${color} - ${size}`);
  }
  
  const availableStock = variation.quantity - variation.reservedStock;
  if (availableStock < quantity) {
    throw new Error(`Insufficient stock for ${color} - ${size}. Available: ${availableStock}`);
  }
  
  variation.reservedStock += quantity;
  return this;
};

// Method to release reserved stock for a variation
productSchema.methods.releaseVariationStock = function (color, size, quantity) {
  const variation = this.findVariation(color, size);
  if (!variation) {
    throw new Error(`Variation not found: ${color} - ${size}`);
  }
  
  variation.reservedStock = Math.max(0, variation.reservedStock - quantity);
  return this;
};

// Method to consume stock for a variation (reduce quantity and reserved)
productSchema.methods.consumeVariationStock = function (color, size, quantity, orderId) {
  const variation = this.findVariation(color, size);
  if (!variation) {
    throw new Error(`Variation not found: ${color} - ${size}`);
  }
  
  if (variation.reservedStock < quantity) {
    throw new Error(`Insufficient reserved stock for ${color} - ${size}`);
  }
  
  variation.quantity -= quantity;
  variation.reservedStock -= quantity;
  this.addStockHistory("sale", quantity, orderId, `Stock consumed for variation: ${color} - ${size}`);
  return this;
};

// Method to get total available stock across all variations
productSchema.methods.getTotalAvailableStock = function () {
  if (!this.hasVariations || !this.variations || this.variations.length === 0) {
    return this.availableStock;
  }
  
  return this.variations.reduce((total, variation) => {
    return total + Math.max(0, variation.quantity - variation.reservedStock);
  }, 0);
};

// Method to get low stock variations
productSchema.methods.getLowStockVariations = function () {
  if (!this.variations || this.variations.length === 0) {
    return [];
  }
  
  return this.variations.filter((variation) => {
    const availableStock = variation.quantity - variation.reservedStock;
    return availableStock <= variation.lowStockThreshold && variation.isActive;
  });
};

// Method to update variation stock
productSchema.methods.updateVariationStock = function (color, size, quantity, type = "adjustment") {
  const variation = this.findVariation(color, size);
  if (!variation) {
    throw new Error(`Variation not found: ${color} - ${size}`);
  }
  
  const oldQuantity = variation.quantity;
  variation.quantity = quantity;
  
  this.addStockHistory(
    type,
    quantity - oldQuantity,
    null,
    `Stock ${type} for variation: ${color} - ${size}`
  );
  
  return this;
};

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
