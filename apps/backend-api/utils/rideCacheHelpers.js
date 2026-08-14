// utils/rideCacheHelpers.js
//
// Shared helpers used by rideController.js so every ride-lifecycle handler
// (book / accept / start / complete / cancel) invalidates the same set of
// Redis keys the same way, instead of each copying its own block. This was
// previously duplicated six times, and one of those copies (bookRide) had
// drifted and silently referenced an undefined `ride` variable, meaning the
// caches it was supposed to clear were never actually cleared.
const Driver = require("../models/Driver");
const redisClient = require("../config/redis");

/**
 * Clears every Redis cache key that can go stale after a ride's state
 * changes (booked, accepted, started, completed, or cancelled).
 * Never throws — a Redis hiccup should not fail the underlying request.
 */
const clearRideCaches = async (ride) => {
  try {
    if (!redisClient || !ride) return;

    // The admin dashboard's "all rides" list
    await redisClient.del("admin:rides:driver:all:rider:all");

    // The rider's own history + "current ride" views
    if (ride.rider) {
      const riderId = ride.rider._id
        ? ride.rider._id.toString()
        : ride.rider.toString();
      await redisClient.del(`rider_history:${riderId}`);
      await redisClient.del(`user_active_ride:${riderId}`);
    }

    // The assigned driver's history + "current ride" views
    if (ride.driver) {
      const driverId = ride.driver._id
        ? ride.driver._id.toString()
        : ride.driver.toString();
      await redisClient.del(`driver_history:${driverId}`);
      await redisClient.del(`driver_active_ride:${driverId}`);
    }

    // Admin dashboard counters
    await redisClient.del("admin:action_queue_stats");
  } catch (redisErr) {
    console.warn("⚠️ Redis cache clearing warning:", redisErr.message);
  }
};

/**
 * Updates a driver's dutyStatus and clears the caches that depend on it
 * (the admin driver list, the live map, and that driver's "current ride"
 * view). Centralizes what used to be a mix of a nonexistent `isAvailable`
 * field (a no-op under Mongoose's default strict mode) and ad-hoc cache
 * clearing scattered across the ride controller.
 */
const setDriverDutyStatus = async (driverId, dutyStatus) => {
  await Driver.findByIdAndUpdate(driverId, { dutyStatus });

  try {
    if (redisClient) {
      await redisClient.del("admin:all_drivers");
      await redisClient.del("admin:live_locations");
      await redisClient.del(`driver_active_ride:${driverId}`);
    }
  } catch (redisErr) {
    console.warn("⚠️ Redis cache clearing warning:", redisErr.message);
  }
};

module.exports = { clearRideCaches, setDriverDutyStatus };
