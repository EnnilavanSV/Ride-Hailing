const User = require("../models/User");
const Driver = require("../models/Driver");
const Ride = require("../models/Ride");
const Dispute = require("../models/Dispute");

const redisClient = require("../config/redis");

const getAllUsers = async (req, res) => {
  try {
    const cacheKey = "admin:all_users";

    const cachedUsers = await redisClient.get(cacheKey);
    if (cachedUsers) {
      console.log("⚡ Serving Users from Redis");
      return res.status(200).json(JSON.parse(cachedUsers));
    }

    console.log("🗄️ Serving Users from MongoDB");

    const users = await User.find({}).select("-password");

    const responseData = {
      success: true,
      count: users.length,
      data: users,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get All Users Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const cacheKey = "admin:all_drivers";

    const cachedDrivers = await redisClient.get(cacheKey);
    if (cachedDrivers) {
      console.log("⚡ Serving Drivers from Redis");
      return res.status(200).json(JSON.parse(cachedDrivers));
    }
    console.log("🗄️ Serving Drivers from MongoDB");

    //  Fetch drivers (using .lean()) and the active count simultaneously
    const [baseDrivers, activeCount] = await Promise.all([
      Driver.find({}).select("-password").lean(),
      Driver.countDocuments({ status: "active" }),
    ]);

    //  Loop through each driver and count their completed rides
    const driversWithStats = await Promise.all(
      baseDrivers.map(async (driver) => {
        const completedCount = await Ride.countDocuments({
          driver: driver._id,
          status: "completed", // Ensure this matches your Ride schema's exact string!
        });

        return {
          ...driver,
          completedRides: completedCount,
        };
      }),
    );

    const responseData = {
      success: true,
      count: driversWithStats.length,
      activeCount: activeCount,
      data: driversWithStats, //  Serving the enriched data array
    };

    // Cache the updated response for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get All Drivers Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllRides = async (req, res) => {
  try {
    //  Grab the query parameters sent from the frontend buttons
    const { driverId, userId } = req.query;

    //  Build a dynamic database filter based on your exact schema
    const filter = {};
    if (driverId) filter.driver = driverId;

    if (userId) filter.rider = userId;

    //  Create a dynamic cache key
    const cacheKey = `admin:rides:driver:${driverId || "all"}:rider:${userId || "all"}`;

    const cachedRides = await redisClient.get(cacheKey);
    if (cachedRides) {
      console.log("⚡ Serving Rides from Redis");
      return res.status(200).json(JSON.parse(cachedRides));
    }
    console.log("🗄️ Serving Rides from MongoDB");

    //  Fetch and populate based on your exact schema references
    const rides = await Ride.find(filter)
      .populate("rider", "name email phone") //
      .populate("driver", "name email phone")
      .sort({ createdAt: -1 });

    const responseData = {
      success: true,
      count: rides.length,
      data: rides,
    };

    // Cache the specific result for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get All Rides Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllDisputes = async (req, res) => {
  try {
    const cacheKey = "admin:all_disputes";

    const cachedDisputes = await redisClient.get(cacheKey);
    if (cachedDisputes) {
      console.log("⚡ Serving Disputes from Redis");
      return res.status(200).json(JSON.parse(cachedDisputes));
    }

    console.log("🗄️ Serving Disputes from MongoDB");

    const disputes = await Dispute.find({})
      .populate("ride", "pickupLocation dropoffLocation fare status")
      .populate("raisedBy", "name email phone") // The person who complained
      .sort({ createdAt: -1 }); // Newest complaints first

    const responseData = {
      success: true,
      count: disputes.length,
      data: disputes,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get All Disputes Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const resolveDispute = async (req, res) => {
  try {
    const Dispute = require("../models/Dispute");
    const disputeId = req.params.id;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found" });
    }

    dispute.status = "resolved";
    dispute.resolvedAt = Date.now();
    // You could also save which admin resolved it if you are tracking admin IDs!

    await dispute.save();

    res.status(200).json({
      success: true,
      message: "Dispute marked as resolved",
      data: dispute,
    });
  } catch (error) {
    console.error(`❌ Resolve Dispute Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getActionQueueStats = async (req, res) => {
  try {
    const cacheKey = "admin:action_queue_stats";

    const cachedStats = await redisClient.get(cacheKey);
    if (cachedStats) {
      console.log("⚡ Serving Action Queue Stats from Redis");
      return res.status(200).json(JSON.parse(cachedStats));
    }

    console.log("🗄️ Serving Action Queue Stats from MongoDB");

    //  Fetch from Database using Promise.all for parallel execution (much faster!)
    const [pendingDriversCount, activeRidesCount, openDisputesCount] =
      await Promise.all([
        Driver.countDocuments({ status: "pending_approval" }),
        Ride.countDocuments({ status: { $in: ["accepted", "in_progress"] } }),
        Dispute.countDocuments({ status: "open" }), // ⭐ Now using your actual Dispute model!
      ]);

    const responseData = {
      success: true,
      data: {
        pendingDrivers: pendingDriversCount,
        activeRides: activeRidesCount,
        openDisputes: openDisputesCount,
      },
    };

    // Dashboards need fresh data, so a short 1-minute cache prevents spamming
    // the DB while keeping the numbers highly accurate.
    await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Action Queue Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getPendingDrivers = async (req, res) => {
  try {
    const cacheKey = "admin:pending_drivers";

    const cachedDrivers = await redisClient.get(cacheKey);
    if (cachedDrivers) {
      console.log("⚡ Serving Pending Drivers from Redis");
      return res.status(200).json(JSON.parse(cachedDrivers));
    }

    console.log("🗄️ Serving Pending Drivers from MongoDB");

    const pendingDrivers = await Driver.find({
      status: "pending_approval",
    }).select("-password");

    const responseData = {
      success: true,
      count: pendingDrivers.length,
      data: pendingDrivers,
    };

    //  Cache the result for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get Pending Drivers Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const approveDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    // Flip the status to active
    driver.status = "active";
    await driver.save();

    await redisClient.del("admin:all_drivers");
    await redisClient.del("admin:action_queue_stats");

    res.status(200).json({
      success: true,
      message: "Driver approved successfully",
      data: driver,
    });
  } catch (error) {
    console.error(`❌ Approve Driver Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const rejectDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    // Flip the status to rejected
    driver.status = "rejected";
    await driver.save();

    await redisClient.del("admin:all_drivers");
    await redisClient.del("admin:action_queue_stats");

    res.status(200).json({
      success: true,
      message: "Driver application rejected",
      data: driver,
    });
  } catch (error) {
    console.error(`❌ Reject Driver Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const suspendDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    // The frontend sends either "suspended" or "active" in the body
    const { status } = req.body;

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    driver.status = status;

    if (status === "suspended") {
      driver.dutyStatus = "offline";
    }

    await driver.save();

    await redisClient.del("admin:all_drivers");
    await redisClient.del("admin:action_queue_stats");

    res.status(200).json({
      success: true,
      message: `Driver account successfully ${status === "suspended" ? "suspended" : "reactivated"}`,
      data: driver,
    });
  } catch (error) {
    console.error(`❌ Toggle Suspend Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getLiveLocations = async (req, res) => {
  try {
    const Driver = require("../models/Driver");
    const cacheKey = "admin:live_locations";

    //  Check Redis Cache First
    const cachedLocations = await redisClient.get(cacheKey);
    if (cachedLocations) {
      return res.status(200).json(JSON.parse(cachedLocations));
    }

    // Grab drivers whose accounts are approved AND are actively online or on a trip
    const liveDrivers = await Driver.find({
      status: "active",
      dutyStatus: { $in: ["online", "on_trip"] },
    })
      .select("name phone vehicle currentLocation dutyStatus")
      .lean();

    const responseData = {
      success: true,
      count: liveDrivers.length,
      data: liveDrivers,
    };

    //  ULTRA SHORT CACHE (10 Seconds)
    // Live data changes constantly. This debounces the database without making the map stale.
    await redisClient.setEx(cacheKey, 10, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get Live Locations Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const cacheKey = `admin_profile:${adminId}`;

    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      console.log("⚡ Serving Admin Profile from Redis");
      return res.status(200).json(JSON.parse(cachedProfile));
    }

    console.log("🗄️ Serving Admin Profile from MongoDB");

    const admin = await User.findById(adminId).select("-password");

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const responseData = {
      success: true,
      data: admin,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Get Admin Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { name, email, phone } = req.body;

    // Find admin by ID and update with new data
    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { name, email, phone },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    await redisClient.del(`admin_profile:${adminId}`);

    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error("❌ Update Admin Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllUsers,
  getAllDrivers,
  getAllRides,
  getAllDisputes,
  resolveDispute,
  getActionQueueStats,
  getPendingDrivers,
  approveDriver,
  rejectDriver,
  suspendDriver,
  getLiveLocations,
  getAdminProfile,
  updateAdminProfile,
};
