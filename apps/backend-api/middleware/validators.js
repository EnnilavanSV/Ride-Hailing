// middleware/validators.js
//
// express-validator chains for the write endpoints that most needed it:
// registration/login (bad input currently throws deep inside a Mongoose
// call and comes back as a raw 500), booking (missing/malformed
// coordinates), disputes, location updates, and admin driver-status
// changes. Pair each of these with `validate()` from ./validate.js in the
// route file, e.g. `router.post("/book", protect, validate(bookRideValidator), bookRide)`.
const { body, param } = require("express-validator");
const { FARE_RATES } = require("../utils/fareCalculator");

const registerUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
];

const registerDriverValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone").notEmpty().withMessage("Phone number is required"),
];

const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const addAddressValidator = [
  body("title").trim().notEmpty().withMessage("Address title is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
];

const createDisputeValidator = [
  body("rideId").isMongoId().withMessage("A valid rideId is required"),
  body("reason")
    .isIn([
      "fare_issue",
      "driver_behavior",
      "rider_behavior",
      "safety_concern",
      "lost_item",
      "other",
    ])
    .withMessage("Invalid dispute reason"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

const bookRideValidator = [
  body("pickupLocation.address")
    .trim()
    .notEmpty()
    .withMessage("Pickup address is required"),
  body("pickupLocation.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("A valid pickup latitude is required"),
  body("pickupLocation.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("A valid pickup longitude is required"),
  body("dropoffLocation.address")
    .trim()
    .notEmpty()
    .withMessage("Dropoff address is required"),
  body("dropoffLocation.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("A valid dropoff latitude is required"),
  body("dropoffLocation.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("A valid dropoff longitude is required"),
  body("vehicleType")
    .optional()
    .isIn(Object.keys(FARE_RATES))
    .withMessage("Invalid vehicle type"),
];

const updateLocationValidator = [
  body("lat").isFloat({ min: -90, max: 90 }).withMessage("A valid latitude is required"),
  body("lng").isFloat({ min: -180, max: 180 }).withMessage("A valid longitude is required"),
];

const updateVehicleValidator = [
  body("make").optional().trim().notEmpty().withMessage("Make cannot be empty"),
  body("model").optional().trim().notEmpty().withMessage("Model cannot be empty"),
  body("licensePlate")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License plate cannot be empty"),
  body("vehicleColor").optional().trim(),
];

const suspendDriverValidator = [
  param("id").isMongoId().withMessage("Invalid driver id"),
  body("status")
    .isIn(["suspended", "active"])
    .withMessage("status must be 'suspended' or 'active'"),
];

const mongoIdParamValidator = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];

module.exports = {
  registerUserValidator,
  registerDriverValidator,
  loginValidator,
  addAddressValidator,
  createDisputeValidator,
  bookRideValidator,
  updateLocationValidator,
  updateVehicleValidator,
  suspendDriverValidator,
  mongoIdParamValidator,
};
