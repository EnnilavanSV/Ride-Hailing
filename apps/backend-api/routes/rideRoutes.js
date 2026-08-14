// apps/backend-api/routes/rideRoutes.js
const express = require("express");
const router = express.Router();
const {
  acceptRide,
  bookRide,
  cancelRideByRider,
  cancelRideByDriver,
  startRide,
  completeRide,
  getDriverHistory,
  getRiderHistory,
  getCurrentUserRide,
  getCurrentDriverRide,
} = require("../controllers/rideController");
const { protect, protectDriver } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  bookRideValidator,
  mongoIdParamValidator,
} = require("../middleware/validators");

// Define the endpoints

router.get("/rider/history", protect, getRiderHistory);
router.get("/driver/history", protectDriver, getDriverHistory);
router.get("/current/user", protect, getCurrentUserRide);
router.get("/current/driver", protectDriver, getCurrentDriverRide);
router.post("/book", protect, validate(bookRideValidator), bookRide);
router.put(
  "/:rideId/cancel",
  protect,
  validate(mongoIdParamValidator("rideId")),
  cancelRideByRider,
);
router.put(
  "/:rideId/driver-cancel",
  protectDriver,
  validate(mongoIdParamValidator("rideId")),
  cancelRideByDriver,
);
router.put(
  "/:id/accept",
  protectDriver,
  validate(mongoIdParamValidator("id")),
  acceptRide,
);
router.put(
  "/:id/start",
  protectDriver,
  validate(mongoIdParamValidator("id")),
  startRide,
);
router.put(
  "/:id/complete",
  protectDriver,
  validate(mongoIdParamValidator("id")),
  completeRide,
);

module.exports = router;
