const { check } = require("express-validator");
const validatorMiddleWare = require("../middleWares/validatorMiddleware");

exports.updateOrderValidator = [
  check("status")
    .optional()
    .isIn(["pending", "Approved", "shipping", "completed", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
  check("isPaid").optional().isBoolean().withMessage("isPaid must be boolean"),
  check("paymentMethod")
    .optional()
    .isIn(["cash on delivery", "online payment", "Paymob"])
    .withMessage("Invalid payment method"),
  validatorMiddleWare,
];


