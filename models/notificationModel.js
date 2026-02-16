const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    type: {
      type: String,
      enum: [
        "general", 
        "special_offers", 
        "promo_discounts", 
        "payments", 
        "cashback", 
        "app_updates", 
        "new_service"
      ],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      maxlength: [100, "Title too long"],
    },
    body: {
      type: String,
      required: [true, "Notification body is required"],
      maxlength: [500, "Body too long"],
    },
    icon: {
      type: String, // URL or icon name
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Additional data (order ID, product ID, etc.)
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { 
    timestamps: true,
    index: { user: 1, createdAt: -1 } // Optimize queries by user and date
  }
);

notificationSchema.pre("save", function (next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;