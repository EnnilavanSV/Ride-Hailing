const mongoose = require("mongoose");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const Dispute = require("../models/Dispute");
const jwt = require("jsonwebtoken");

const redisClient = require("../config/redis");

// Helper function to generate the token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new driver
// @route   POST /api/drivers/register
// @access  Public
const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const driverExists = await Driver.findOne({ email });
    if (driverExists) {
      return res
        .status(400)
        .json({ success: false, message: "Driver already exists" });
    }

    const driver = await Driver.create({
      name,
      email,
      password,
      phone,
    });

    if (driver) {
      await redisClient.del("admin:all_drivers"); //Clear the admin driver list so the new driver shows up instantly!

      res.status(201).json({
        success: true,
        data: {
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          status: driver.status,
          token: generateToken(driver._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid driver data" });
    }
  } catch (error) {
    console.error(`❌ Driver Registration Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    //  Find the driver by email
    const driver = await Driver.findOne({ email }).select("+password");

    //  Check if the driver exists AND the password matches the hashed password
    if (driver && (await driver.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          status: driver.status,
          token: generateToken(driver._id),
        },
      });
    } else {
      //  Return 401 Unauthorized if credentials fail
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(`❌ Driver Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateVehicleDetails = async (req, res) => {
  try {
    // req.driver._id comes from your authentication middleware
    const { make, model, licensePlate, vehicleColor } = req.body;

    const driver = await Driver.findById(req.driver._id);

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    // Update vehicle details
    driver.vehicle = {
      make,
      model,
      licensePlate,
      vehicleColor,
    };

    // Update status so they can now be reviewed by an admin, or set to 'active'
    driver.status = "pending_approval";

    await driver.save();
    await redisClient.del("admin:all_drivers");

    res.status(200).json({
      success: true,
      message: "Vehicle details updated successfully",
      data: driver,
    });
  } catch (error) {
    console.error(`❌ Vehicle Update Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateDutyStatus = async (req, res) => {
  try {
    // req.driver._id comes from your protectDriver middleware
    const driver = await Driver.findById(req.driver._id);
    const driverId = req.driver._id;

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    //  Toggle the string value instead of a boolean
    if (driver.dutyStatus === "online") {
      driver.dutyStatus = "offline";
    } else {
      driver.dutyStatus = "online";
    }

    await driver.save();

    // Clear admin drivers list so availability updates instantly on the God-Mode map
    await redisClient.del("admin:all_drivers");
    await redisClient.del(`driver_active_ride:${driverId}`);

    res.status(200).json({
      success: true,
      message: `Driver is now ${driver.dutyStatus}`,
      dutyStatus: driver.dutyStatus, // Send the new string back to React
    });
  } catch (error) {
    console.error(`❌ Toggle Availability Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getDriverEarnings = async (req, res) => {
  try {
    const driverId = req.driver._id;
    const cacheKey = `driver_earnings:${driverId}`;

    //  Check Redis Cache First
    const cachedEarnings = await redisClient.get(cacheKey);
    if (cachedEarnings) {
      console.log("⚡ Serving Driver Earnings from Redis");
      return res.status(200).json(JSON.parse(cachedEarnings));
    }

    console.log("🗄️ Serving Driver Earnings from MongoDB");

    //  Fetch completed rides for this driver from MongoDB
    const completedRides = await Ride.find({
      driver: driverId,
      status: "completed",
    }).sort({ createdAt: -1 });

    //  Calculate total earnings using MongoDB Aggregation
    const aggregationResult = await Ride.aggregate([
      {
        $match: {
          driver: new mongoose.Types.ObjectId(driverId),
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$fare" },
        },
      },
    ]);

    const total =
      aggregationResult.length > 0 ? aggregationResult[0].totalEarnings : 0;

    //  Structure the Response Data
    const responseData = {
      success: true,
      data: {
        totalEarnings: total,
        rides: completedRides,
      },
    };

    //  Save to Redis Cache (expires in 1 hour / 3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    //  Send Response
    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get Driver Earnings Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getDriverProfile = async (req, res) => {
  try {
    const driverId = req.driver._id;
    const cacheKey = `driver_profile:${driverId}`;

    //  Check Redis Cache First
    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      console.log("⚡ Serving Driver Profile from Redis");
      return res.status(200).json(JSON.parse(cachedProfile));
    }

    console.log("🗄️ Serving Driver Profile from MongoDB");

    //  Find the driver by ID if not in cache
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const responseData = {
      success: true,
      data: driver,
    };

    // Cache the result for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    // Send the data back matching what the frontend expects
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching driver profile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const updateDriverProfile = async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      req.driver._id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      },
      { new: true, runValidators: true },
    );

    await redisClient.del(`driver_profile:${driverId}`);

    res.status(200).json({ success: true, data: updatedDriver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "Missing coordinates" });
    }

    const driver = await require("../models/Driver").findByIdAndUpdate(
      req.driver._id,
      { currentLocation: { lat, lng } },
      { returnDocument: "after" },
    );

    res.status(200).json({ success: true, data: driver.currentLocation });
  } catch (error) {
    console.error(`❌ Update Location Error: ${error.message}`);
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
  updateDutyStatus,
  registerDriver,
  loginDriver,
  updateVehicleDetails,
  getDriverEarnings,
  getDriverProfile,
  updateDriverProfile,
  updateLocation,
  createDispute,
};
