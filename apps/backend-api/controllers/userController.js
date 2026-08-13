const User = require("../models/User");
const Dispute = require("../models/Dispute");
const jwt = require("jsonwebtoken");

const redisClient = require("../config/redis");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // We use the matchPassword method we just created in the User model
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin,
          token: generateToken(user._id), //
        },
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(`❌ Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const cacheKey = `user_profile:${req.user._id}`;

    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      console.log("⚡ Serving User Profile from Redis");
      return res.status(200).json(JSON.parse(cachedProfile));
    }

    console.log("🗄️ Serving User Profile from MongoDB");
    // req.user._id comes from your protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      const responseData = {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          savedAddresses: user.savedAddresses,
        },
      };

      await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

      res.status(200).json(responseData);
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// userController.js
// Inside userController.js
const updateUserProfile = async (req, res) => {
  try {
    //
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);

    if (user) {
      // Update fields if they were provided in the request
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();

      await redisClient.del(`user_profile:${userId}`);

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    //
    console.error("❌ Profile Update Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during update",
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const { title, address } = req.body;

    // Find the user using the authenticated token ID
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Push the new address to the array
    user.savedAddresses.push({ title, address });
    const updatedUser = await user.save();

    await redisClient.del(`user_profile:${req.user._id}`);

    res.status(201).json({
      success: true,
      data: updatedUser.savedAddresses,
      message: "Address saved successfully",
    });
  } catch (error) {
    console.error("Add Address Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Filter out the address that matches the ID passed in the URL parameters
    user.savedAddresses = user.savedAddresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId,
    );

    const updatedUser = await user.save();

    await redisClient.del(`user_profile:${req.user._id}`);

    res.status(200).json({
      success: true,
      data: updatedUser.savedAddresses,
      message: "Address removed successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createDispute = async (req, res) => {
  try {
    const { rideId, reason, description } = req.body;

    if (!rideId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a Ride ID, select a reason, and describe the issue.",
      });
    }

    // Dynamically determine who is raising the dispute based on the auth middleware
    let raisedBy;
    let raisedByModel;

    if (req.user) {
      raisedBy = req.user._id;
      raisedByModel = "User";
    } else if (req.driver) {
      raisedBy = req.driver._id;
      raisedByModel = "Driver";
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const dispute = await Dispute.create({
      ride: rideId,
      raisedBy,
      raisedByModel,
      reason,
      description,
    });

    await redisClient.del("admin:all_disputes");

    res.status(201).json({
      success: true,
      message:
        "Dispute submitted successfully. Our team will review it shortly.",
      data: dispute,
    });
  } catch (error) {
    console.error(`❌ Create Dispute Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  createDispute,
};
