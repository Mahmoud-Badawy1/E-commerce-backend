const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");
const JWT = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/createToken");
const sanitize = require("../utils/sanitizeData");
const sendEmails = require("../utils/sendEmail");
const userModel = require("../models/userModel");
const ApiError = require("../utils/apiError");

dotenv.config({ path: "config.env" });

exports.logIn = asyncHandler(async (req, res, next) => {
  const user = await userModel
    .findOne({ email: req.body.email })
    .select("+password");

  if (!user) {
    return next(new ApiError("E-Mail or password is wrong", 400));
  }

  // green flag
  // if (user.active === false) {
  //   return next(
  //     new ApiError(
  //       "Your account is not active, please contact the administrator.",
  //       403
  //     )
  //   );
  // }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password || ""
  );

  if (!isPasswordValid) {
    return next(new ApiError("E-Mail or password is wrong", 400));
  }

  const token = createToken(user._id);
  user.password = undefined;

  res.status(200).json({ data: sanitize.sanitizeUser(user), token });
});

exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    active: false,
  });
  const OTP = crypto.randomInt(100000, 999999);

  user.twoFactorCode = OTP;
  user.twoFactorExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  const options = {
    email: user.email,
    subject: "Verify your account",
    message: `Your verification code is ${OTP}. It will expire in 5 minutes.`,
  };

  await sendEmails(options);

  res.status(201).json({
    message: "Please verify your email address using the received code.",
    data: sanitize.sanitizeUser(user),
  });
});

exports.googleAuth = asyncHandler(async (req, res, next) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { idToken } = req.body;

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  if (!email || !googleId) {
    return next(new ApiError("Invalid Google token", 400));
  }

  let user = await userModel.findOne({ email });

  if (user && !user.googleId) {
    return next(
      new ApiError(
        "Email already used with password. Please login manually.",
        400
      )
    );
  }

  if (!user) {
    user = await userModel.create({
      name,
      email,
      googleId,
      active: true,
    });
  }

  const token = createToken(user._id);

  res.status(200).json({ data: sanitize.sanitizeUser(user), token });
});

exports.verify2FA = asyncHandler(async (req, res, next) => {
  const { email, OTP } = req.body;

  const user = await userModel
    .findOne({ email })
    .select("+twoFactorCode +twoFactorExpires");

  if (!user) {
    return next(new ApiError("User not found.", 404));
  }

  if (user.twoFactorExpires < Date.now()) {
    return next(
      new ApiError(
        "Verification code has expired. Please request a new code.",
        400
      )
    );
  }

  if (user.twoFactorCode !== parseInt(OTP)) {
    return next(new ApiError("Invalid verification code.", 401));
  }

  const token = createToken(user._id);

  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  user.active = true;
  await user.save();

  res.status(200).json({ data: sanitize.sanitizeUser(user), token });
});

exports.resend2FACode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new ApiError("User not found.", 404));
  }

  if (user.active === false && user.twoFactorCode == null) {
    return next(
      new ApiError(
        "Your account is not active, please contact the administrator.",
        403
      )
    );
  }

  const OTP = crypto.randomInt(100000, 999999);

  user.twoFactorCode = OTP;
  user.twoFactorExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  const options = {
    email: user.email,
    subject: "Your new 2FA Code",
    message: `Your new verification code is ${OTP}. It will expire in 5 minutes.`,
  };

  await sendEmails(options);

  res.status(200).json({
    message: "New verification code has been sent to your email.",
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("You are not login , please login and try again.", 401)
    );
  }

  const decoded = JWT.verify(token, process.env.JWT_SECRET);

  const currentUser = await userModel.findOne({
    _id: decoded.userId,
    // active: true,
  });
  // if (!currentUser) {
  //   return next(new ApiError("User not found or not activated", 401));
  // }

  if (currentUser.changedPasswordAt) {
    const CPTFormat = parseInt(
      currentUser.changedPasswordAt.getTime() / 1000,
      10
    );
    if (CPTFormat > decoded.iat) {
      return next(
        new ApiError("The password is changed, please login again", 401)
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user);
      
      return next(new ApiError("You are not allowed to use this route", 403));
    }
    next();
  });
