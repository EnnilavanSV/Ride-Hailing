const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const { calculateFare } = require("../utils/fareCalculator");
const { clearRideCaches, setDriverDutyStatus } = require("../utils/rideCacheHelpers");

const redisClient = require("../config/redis");

const bookRide = async (req, res) => {
  try {
    // Extract the exact fields your Ride schema expects from the request body
    const { pickupLocation, dropoffLocation, vehicleType } = req.body;

    //  BUGFIX: pricing now comes from the single shared calculateFare()
    //  helper (utils/fareCalculator.js) instead of being reimplemented
    //  inline here with its own, separate rate table.
    const calculatedFare = calculateFare(
      pickupLocation.lat,
      pickupLocation.lng,
      dropoffLocation.lat,
      dropoffLocation.lng,
      vehicleType,
    );

    // Create the ride document in the database
    // Note: req.user._id is provided by your auth middleware
    const newRide = await Ride.create({
      rider: req.user._id,
      pickupLocation,
      dropoffLocation,
      vehicleType,
      fare: calculatedFare,
      status: "requested", // Matches the default in your schema
    });

    await newRide.populate("rider", "name phone rating");

    //  BUGFIX: this used to reference an undefined `ride` variable
    //  (only `newRide` existed in scope), which threw and was silently
    //  swallowed — meaning the admin/rider caches were never actually
    //  cleared after a new ride was booked. clearRideCaches() takes the
    //  ride directly now, so there's nothing to get out of sync.
    await clearRideCaches(newRide);

    // Grab the io instance from the app
    const io = req.app.get("io");

    // Broadcast the new ride to everyone (Drivers will listen for this)
    io.emit("newRideRequest", newRide);

    res.status(201).json({
      success: true,
      data: newRide,
    });
  } catch (error) {
    console.error(`❌ Book Ride Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const cancelRideByRider = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // Safety Check: Ensure rider ID is evaluated correctly whether populated or raw ObjectId
    const riderId = ride.rider._id
      ? ride.rider._id.toString()
      : ride.rider.toString();

    // Security Check: Only the rider who booked it can cancel it
    if (riderId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this ride",
      });
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ride that is already ${ride.status}`,
      });
    }

    // Free up the driver if one was assigned
    if (ride.driver) {
      const driverId = ride.driver._id
        ? ride.driver._id.toString()
        : ride.driver.toString();
      //  BUGFIX: the Driver schema tracks availability via `dutyStatus`
      //  (offline/online/on_trip), not an `isAvailable` field — the old
      //  `{ isAvailable: true }` update was a silent no-op under
      //  Mongoose's default strict mode, so a driver's status never
      //  actually reset after a rider cancelled on them.
      await setDriverDutyStatus(driverId, "online");
    }

    //  SAVE TO MONGODB
    ride.status = "cancelled";
    const updatedRide = await ride.save();

    // Clear rider/driver/admin caches for this ride in one place
    await clearRideCaches(ride);

    // Socket Emits: Tell both rooms the RIDER cancelled
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${riderId}`).emit("rideCancelled", {
        rideId,
        cancelledBy: "rider",
      });

      if (ride.driver) {
        const driverId = ride.driver._id
          ? ride.driver._id.toString()
          : ride.driver.toString();
        io.to(`driver_${driverId}`).emit("rideCancelled", {
          rideId,
          cancelledBy: "rider",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully by rider.",
      data: updatedRide,
    });
  } catch (error) {
    console.error(`❌ Rider Cancel Error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const cancelRideByDriver = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }
    const driverId = req.driver._id.toString();

    // Security Check: Only the assigned driver can cancel it
    if (!ride.driver || ride.driver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not the assigned driver for this ride",
      });
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ride that is already ${ride.status}`,
      });
    }

    // Free up the driver (see BUGFIX note in cancelRideByRider above)
    await setDriverDutyStatus(req.driver._id, "online");

    ride.status = "cancelled";
    await ride.save();

    // Clear rider/driver/admin caches for this ride in one place
    await clearRideCaches(ride);

    // Socket Emits: Tell both rooms the DRIVER cancelled
    const io = req.app.get("io");
    if (io) {
      const riderRoomId = ride.rider._id
        ? ride.rider._id.toString()
        : ride.rider.toString();
      const driverRoomId = ride.driver._id
        ? ride.driver._id.toString()
        : ride.driver.toString();

      io.to(`user_${riderRoomId}`).emit("rideCancelled", {
        rideId,
        cancelledBy: "driver",
      });

      io.to(`driver_${driverRoomId}`).emit("rideCancelled", {
        rideId,
        cancelledBy: "driver",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully by driver.",
      data: ride,
    });
  } catch (error) {
    console.error(`❌ Driver Cancel Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const acceptRide = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id);

    if (driver.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. You cannot accept rides.",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // Ensure the ride hasn't already been scooped up by someone else
    if (ride.status !== "requested") {
      return res
        .status(400)
        .json({ success: false, message: "Ride is no longer available" });
    }

    ride.driver = req.driver._id;
    ride.status = "accepted";

    await ride.save();

    //  BUGFIX: the driver is now actually on a trip — reflect that in
    //  dutyStatus so the live map and matching logic see it (previously
    //  nothing in the codebase ever set "on_trip", so it was dead state).
    await setDriverDutyStatus(req.driver._id, "on_trip");

    const populatedRide = await Ride.findById(ride._id)
      .populate("rider", "name phone rating")
      .populate("driver", "name phone rating vehicle");

    // Clear rider, driver, and admin caches for this ride in one place
    await clearRideCaches(populatedRide);

    // Grab the io instance from the app
    const io = req.app.get("io");

    const riderRoom = `user_${ride.rider._id || ride.rider.toString()}`;
    console.log("📡 Emitting rideAccepted to room:", riderRoom);
    io.to(riderRoom).emit("rideAccepted", populatedRide);

    res.status(200).json({
      success: true,
      data: populatedRide,
    });
  } catch (error) {
    console.error(`❌ Accept Ride Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const startRide = async (req, res) => {
  try {
    const { id } = req.params; // Ensure this matches your route parameter (e.g., /:id/start)
    const ride = await Ride.findById(id);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // Security Check: Only the assigned driver can start the ride
    const driverId = req.driver._id
      ? req.driver._id.toString()
      : req.driver.toString();
    const assignedDriverId = ride.driver ? ride.driver.toString() : null;

    if (assignedDriverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to start this ride",
      });
    }

    // State Check: Only 'accepted' rides can transition to 'in_progress'
    if (ride.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: `Cannot start a ride that is currently ${ride.status}`,
      });
    }

    //  UPDATE MONGODB
    ride.status = "in_progress";
    await ride.save();

    // Re-populate the data so the frontend has fresh info for the In-Progress screens
    const populatedRide = await Ride.findById(ride._id)
      .populate("rider", "name phone rating")
      .populate("driver", "name phone rating vehicle");

    // Clear rider, driver, and admin caches for this ride in one place
    await clearRideCaches(populatedRide);

    //  SOCKET.IO EMIT TO RIDER
    const io = req.app.get("io");
    if (io) {
      const riderRoomId = ride.rider._id
        ? ride.rider._id.toString()
        : ride.rider.toString();

      console.log(`📡 Emitting rideStarted to room: user_${riderRoomId}`);
      io.to(`user_${riderRoomId}`).emit("rideStarted", { ride: populatedRide });
    }

    res.status(200).json({
      success: true,
      message: "Ride started successfully",
      data: populatedRide,
    });
  } catch (error) {
    console.error(`❌ Start Ride Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    // Security check: Ensure the driver completing the ride is the one assigned to it
    if (ride.driver.toString() !== req.driver.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized to complete this ride" });
    }

    // Update the ride status
    ride.status = "completed";
    await ride.save();

    //  BUGFIX: make the driver available for new rides again by actually
    //  updating dutyStatus (see BUGFIX note in cancelRideByRider above).
    await setDriverDutyStatus(req.driver.id, "online");

    // Clear rider, driver, and admin caches for this ride in one place
    await clearRideCaches(ride);
    // Earnings totals changed, so that cache needs clearing too
    await redisClient.del(`driver_earnings:${req.driver._id}`);

    // Emit the event to the Rider's room.
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${ride.rider.toString()}`).emit("rideCompleted", ride);
    }

    res.status(200).json({
      success: true,
      message: "Ride completed successfully",
      ride,
    });
  } catch (error) {
    console.error("❌ Complete Ride Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getRiderHistory = async (req, res) => {
  try {
    const cacheKey = `rider_history:${req.user._id}`;

    const cachedHistory = await redisClient.get(cacheKey);
    if (cachedHistory) {
      console.log("⚡ Serving Rider History from Redis");
      return res.status(200).json(JSON.parse(cachedHistory));
    }

    console.log("🗄️ Serving Rider History from MongoDB");
    // Find rides where the rider matches the logged-in user
    // Sort by most recent first (createdAt: -1)
    // Populate the driver's name and vehicle info so the rider can see who drove them
    const rides = await Ride.find({ rider: req.user._id })
      .sort({ createdAt: -1 })
      .populate("driver", "name vehicle");

    const responseData = { success: true, count: rides.length, data: rides };

    // Save to Redis for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get Rider History Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getDriverHistory = async (req, res) => {
  try {
    const cacheKey = `driver_history:${req.driver._id}`;

    const cachedHistory = await redisClient.get(cacheKey);
    if (cachedHistory) {
      console.log("⚡ Serving Driver History from Redis");
      return res.status(200).json(JSON.parse(cachedHistory));
    }

    console.log("🗄️ Serving Driver History from MongoDB");

    const rides = await Ride.find({ driver: req.driver._id })
      .sort({ createdAt: -1 })
      .populate("rider", "name");

    const responseData = { success: true, count: rides.length, data: rides };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`❌ Get Driver History Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getCurrentUserRide = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `user_active_ride:${userId}`;

    // Check Redis Cache First
    const cachedRide = await redisClient.get(cacheKey);
    if (cachedRide) {
      return res.status(200).json(JSON.parse(cachedRide));
    }

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Fetch from Database if not cached
    const activeRide = await Ride.findOne({
      rider: userId,
      status: { $in: ["requested", "accepted", "in_progress"] },
      createdAt: { $gte: twelveHoursAgo },
    })
      .sort({ createdAt: -1 }) // FIX: Always get the newest ride first
      .populate("rider");

    const responseData = { ride: activeRide || null };

    //  ULTRA SHORT CACHE (15 Seconds)
    // Active rides change state fast. A short cache debounces the DB
    // without trapping the rider in a stale UI state.
    await redisClient.setEx(cacheKey, 15, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching current user ride:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getCurrentDriverRide = async (req, res) => {
  try {
    const driverId = req.driver._id;
    const cacheKey = `driver_active_ride:${driverId}`;

    // Check Redis Cache First
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    //  Fetch the driver from the DB to get their status
    const driverProfile = await Driver.findById(driverId);

    if (!driverProfile) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Fetch the active ride
    const activeRide = await Ride.findOne({
      driver: driverId,
      status: { $in: ["requested", "accepted", "in_progress"] },
      createdAt: { $gte: twelveHoursAgo },
    })
      .sort({ createdAt: -1 })
      .populate("driver");

    const responseData = {
      ride: activeRide || null,
      dutyStatus: driverProfile.dutyStatus,
    };

    //  ULTRA SHORT CACHE (15 Seconds)
    // Active rides and duty statuses change fast. This debounces the DB
    // without trapping the driver in a stale UI state.
    await redisClient.setEx(cacheKey, 15, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching current driver ride:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  bookRide,
  cancelRideByRider,
  cancelRideByDriver,
  acceptRide,
  startRide,
  completeRide,
  getRiderHistory,
  getDriverHistory,
  getCurrentUserRide,
  getCurrentDriverRide,
};
