const express = require("express");

const router = express.Router();

const settingController = require("../controller/settingController");
const authController = require("../controller/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    settingController.getSettings
  )
  .post(
    authController.protect,
    // green flag
    authController.allowedTo("admin","seller"),
    settingController.addSetting
  );

router
  .route("/:id")
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    settingController.updateSetting
  );

module.exports = router;
