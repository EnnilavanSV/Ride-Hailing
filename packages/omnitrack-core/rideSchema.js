//Possible Statuses for a Ride
const RIDE_STATUS = {
  SEARCHING: "SEARCHING", // Rider is looking for a driver
  ACCEPTED: "ACCEPTED", // Driver accepted, en route to pickup
  ARRIVED: "ARRIVED", // Driver is at the pickup location
  IN_PROGRESS: "IN_PROGRESS", // Ride has started, en route to dropoff
  COMPLETED: "COMPLETED", // Ride successfully finished
  CANCELLED: "CANCELLED", // Cancelled by rider, driver, or admin
};

// The Ride Blueprint (Documentation & Reference)
// When we build the database and APIs, every Ride request must look exactly like this object:
const rideBlueprint = {
  _id: "unique_ride_id_string",
  riderId: "user_id_string",
  driverId: null, // Starts as null until a driver accepts

  status: RIDE_STATUS.SEARCHING,
  vehicleTier: "MINI", // e.g., 'AUTO', 'MINI', 'SUV'

  // Geospatial Data (MongoDB GeoJSON format)
  pickup: {
    type: "Point",
    coordinates: [76.9558, 11.0168], // [longitude, latitude]
    address: "123 Main St",
  },
  dropoff: {
    type: "Point",
    coordinates: [77.0, 11.05],
    address: "456 Destination Ave",
  },

  // Pricing & Payment
  fare: {
    estimatedAmount: 250,
    finalAmount: null, // Calculated when ride is COMPLETED
    surgeMultiplier: 1.2,
    currency: "INR",
  },
  payment: {
    method: "WALLET", // 'CASH', 'WALLET', 'UPI', 'CARD'
    status: "PENDING", // 'PENDING', 'PAID', 'FAILED'
  },

  // Lifecycle Timestamps
  timestamps: {
    requestedAt: new Date(),
    acceptedAt: null,
    arrivedAt: null,
    startedAt: null,
    endedAt: null,
  },
};

export default { RIDE_STATUS, rideBlueprint };
