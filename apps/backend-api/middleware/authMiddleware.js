const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Driver = require("../models/Driver");

const admin = (req, res, next) => {
  // req.user is set by your existing 'protect' middleware
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, let them through
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

const protect = async (req, res, next) => {
  let token;

  //  Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      //  CRITICAL CHECK: Stop execution if user was deleted or not found
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found in database",
        });
      }

      return next();
    } catch (error) {
      console.error(`❌ Token Verification Failed: ${error.message}`);
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  // If no token was found at all
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

const protectDriver = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get driver from the token and attach it to req.driver (NOT req.user)
      req.driver = await Driver.findById(decoded.id).select("-password");

      if (!req.driver) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, driver not found",
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

module.exports = { admin, protect, protectDriver };
