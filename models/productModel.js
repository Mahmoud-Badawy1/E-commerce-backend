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
    // Product has variations (dynamic attributes)
    hasVariations: {
      type: Boolean,
      default: false,
    },
    // Dynamic variations structure
    variations: {
      // Dynamic axes (e.g., ["Color", "Storage"], ["Size", "Material"])
      axes: {
        type: [String],
        default: [],
      },
      // Variation items
      items: [
        {
          sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
          },
          // Dynamic options as key-value pairs (e.g., { "Color": "Black", "Storage": "128GB" })
          options: {
            type: Map,
            of: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
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
    },
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
  if (this.variations && this.variations.items && this.variations.items.length > 0) {
    this.variations.items.forEach((variation) => {
      // Each variation has its own price and discount
      const varPrice = variation.price;
      const varDiscount = variation.discountPercentage || 0;
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

// Method to find a variation by options (e.g., { "Color": "Black", "Storage": "128GB" })
productSchema.methods.findVariation = function (options) {
  if (!this.variations || !this.variations.items || this.variations.items.length === 0) {
    return null;
  }
  
  return this.variations.items.find((variation) => {
    // Check if all option keys match
    const variationOptions = variation.options;
    const optionKeys = Object.keys(options);
    
    return optionKeys.every((key) => {
      const varValue = variationOptions.get(key);
      return varValue && varValue.toLowerCase() === options[key].toLowerCase();
    });
  });
};

// Method to find variation by SKU
productSchema.methods.findVariationBySku = function (sku) {
  if (!this.variations || !this.variations.items || this.variations.items.length === 0) {
    return null;
  }
  
  return this.variations.items.find(
    (v) => v.sku.toUpperCase() === sku.toUpperCase()
  );
};

// Method to get available stock for a variation
productSchema.methods.getVariationAvailableStock = function (options) {
  const variation = this.findVariation(options);
  if (!variation) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Variation not found: ${optionsStr}`);
  }
  return Math.max(0, variation.quantity - variation.reservedStock);
};

// Method to reserve stock for a variation
productSchema.methods.reserveVariationStock = function (options, quantity) {
  const variation = this.findVariation(options);
  if (!variation) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Variation not found: ${optionsStr}`);
  }
  
  const availableStock = variation.quantity - variation.reservedStock;
  if (availableStock < quantity) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Insufficient stock for ${optionsStr}. Available: ${availableStock}`);
  }
  
  variation.reservedStock += quantity;
  return this;
};

// Method to release reserved stock for a variation
productSchema.methods.releaseVariationStock = function (options, quantity) {
  const variation = this.findVariation(options);
  if (!variation) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Variation not found: ${optionsStr}`);
  }
  
  variation.reservedStock = Math.max(0, variation.reservedStock - quantity);
  return this;
};

// Method to consume stock for a variation (reduce quantity and reserved)
productSchema.methods.consumeVariationStock = function (options, quantity, orderId) {
  const variation = this.findVariation(options);
  if (!variation) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Variation not found: ${optionsStr}`);
  }
  
  if (variation.reservedStock < quantity) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Insufficient reserved stock for ${optionsStr}`);
  }
  
  variation.quantity -= quantity;
  variation.reservedStock -= quantity;
  const optionsStr = JSON.stringify(options);
  this.addStockHistory("sale", quantity, orderId, `Stock consumed for variation: ${optionsStr}`);
  return this;
};

// Method to get total available stock across all variations
productSchema.methods.getTotalAvailableStock = function () {
  if (!this.hasVariations || !this.variations || !this.variations.items || this.variations.items.length === 0) {
    return this.availableStock;
  }
  
  return this.variations.items.reduce((total, variation) => {
    return total + Math.max(0, variation.quantity - variation.reservedStock);
  }, 0);
};

// Method to get low stock variations
productSchema.methods.getLowStockVariations = function () {
  if (!this.variations || !this.variations.items || this.variations.items.length === 0) {
    return [];
  }
  
  return this.variations.items.filter((variation) => {
    const availableStock = variation.quantity - variation.reservedStock;
    return availableStock <= variation.lowStockThreshold && variation.isActive;
  });
};

// Method to update variation stock
productSchema.methods.updateVariationStock = function (options, quantity, type = "adjustment") {
  const variation = this.findVariation(options);
  if (!variation) {
    const optionsStr = JSON.stringify(options);
    throw new Error(`Variation not found: ${optionsStr}`);
  }
  
  const oldQuantity = variation.quantity;
  variation.quantity = quantity;
  
  const optionsStr = JSON.stringify(options);
  this.addStockHistory(
    type,
    quantity - oldQuantity,
    null,
    `Stock ${type} for variation: ${optionsStr}`
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
