const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const notificationModel = require("../models/notificationModel");
const userModel = require("../models/userModel");

// Get my notifications
exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  const since = req.query.since ? new Date(req.query.since) : null;
  const unreadOnly = req.query.unreadOnly === "true";

  const filter = { user: req.user._id };
  
  if (since) {
    filter.createdAt = { $gt: since };
  }
  
  if (unreadOnly) {
    filter.isRead = false;
  }

  const notifications = await notificationModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalNotifications = await notificationModel.countDocuments(filter);
  const unreadCount = await notificationModel.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    status: "success",
    results: notifications.length,
    totalNotifications,
    unreadCount,
    data: notifications,
  });
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await notificationModel.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return next(new ApiError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Notification marked as read",
    data: notification,
  });
});

// Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await notificationModel.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

// Get my notification preferences
exports.getMyNotificationPreferences = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("notificationPreferences");

  res.status(200).json({
    status: "success",
    data: user.notificationPreferences,
  });
});

// Update my notification preferences
exports.updateMyNotificationPreferences = asyncHandler(async (req, res, next) => {
  const { 
    general, 
    special_offers, 
    promo_discounts, 
    payments, 
    cashback, 
    app_updates, 
    new_service 
  } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      notificationPreferences: {
        general: general !== undefined ? general : req.user.notificationPreferences.general,
        special_offers: special_offers !== undefined ? special_offers : req.user.notificationPreferences.special_offers,
        promo_discounts: promo_discounts !== undefined ? promo_discounts : req.user.notificationPreferences.promo_discounts,
        payments: payments !== undefined ? payments : req.user.notificationPreferences.payments,
        cashback: cashback !== undefined ? cashback : req.user.notificationPreferences.cashback,
        app_updates: app_updates !== undefined ? app_updates : req.user.notificationPreferences.app_updates,
        new_service: new_service !== undefined ? new_service : req.user.notificationPreferences.new_service,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Notification preferences updated successfully",
    data: user.notificationPreferences,
  });
});

// Send notification (admin only)
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { 
    userIds, 
    type, 
    title, 
    body, 
    icon, 
    data, 
    sendToAllUsers = false,
    filterByRole 
  } = req.body;

  let targetUsers = [];

  if (sendToAllUsers) {
    // Send to all users with this notification type enabled
    const filter = {};
    filter[`notificationPreferences.${type}`] = true;
    
    if (filterByRole) {
      filter.role = filterByRole;
    }
    
    const users = await userModel.find(filter).select("_id");
    targetUsers = users.map(user => user._id);
  } else if (userIds && userIds.length > 0) {
    // Send to specific users, but check their preferences
    const users = await userModel.find({
      _id: { $in: userIds },
      [`notificationPreferences.${type}`]: true,
    }).select("_id");
    targetUsers = users.map(user => user._id);
  } else {
    return next(new ApiError("Please specify userIds or set sendToAllUsers to true", 400));
  }

  if (targetUsers.length === 0) {
    return next(new ApiError("No users found with enabled notification preferences for this type", 400));
  }

  // Create notifications for all target users
  const notifications = targetUsers.map(userId => ({
    user: userId,
    type,
    title,
    body,
    icon: icon || "",
    data: data || {},
  }));

  const createdNotifications = await notificationModel.insertMany(notifications);

  res.status(201).json({
    status: "success",
    message: `Notification sent to ${createdNotifications.length} users`,
    data: {
      sentCount: createdNotifications.length,
      type,
      title,
    },
  });
});

// Delete notification
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await notificationModel.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return next(new ApiError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  });
});

// Get notification stats (admin only)
exports.getNotificationStats = asyncHandler(async (req, res, next) => {
  const totalNotifications = await notificationModel.countDocuments({});
  const unreadNotifications = await notificationModel.countDocuments({ isRead: false });
  
  const notificationsByType = await notificationModel.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      totalNotifications,
      unreadNotifications,
      notificationsByType,
    },
  });
});