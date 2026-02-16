const express = require("express");
const userController = require("../controller/userController");
const uploadImageMiddleware = require("../middleWares/uploadImageMiddleware");

const router = express.Router();
const userValidator = require("../validators/userValidator");
const authController = require("../controller/authController");

router.get(
  "/getMyData",
  authController.protect,
  userController.getMyData,
  userValidator.getUserValidator
);

router.put(
  "/updateMyData",
  authController.protect,
  userController.updateMyData,
  userValidator.updateUserValidator
);

// Avatar upload routes
router.post(
  "/avatar/upload",
  authController.protect,
  uploadImageMiddleware.uploadSingleImage("avatar"),
  userController.uploadAvatar
);

router.delete(
  "/avatar/remove",
  authController.protect,
  userController.removeAvatar
);

router.put(
  "/updateMyPassword",
  authController.protect,
  userValidator.changePasswordValidator,
  userController.updateMyPassword
);

router.delete(
  "/deactivateMyUser",
  authController.protect,
  userController.deactivateMyUser
);

module.exports = router;
