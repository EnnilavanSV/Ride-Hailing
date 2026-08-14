// utils/fareCalculator.js
//
// Single source of truth for pricing. Previously this file defined a flat
// calculateFare() (base 5 + 2.5/km) that was never actually called, while
// rideController.bookRide reimplemented pricing inline with a different,
// vehicle-type-aware formula. That's now unified here — bookRide just calls
// calculateFare() with the ride's vehicleType.

// Convert degrees to radians for the math functions
const toRadians = (degree) => {
  return degree * (Math.PI / 180);
};

// Per-vehicle-type pricing. Keys must match Ride.vehicleType exactly.
const FARE_RATES = {
  "Ride Standard": { baseFare: 50, perKmRate: 12 },
  "Ride Premium": { baseFare: 50, perKmRate: 22 },
  "Ride XL": { baseFare: 50, perKmRate: 30 },
};
const DEFAULT_VEHICLE_TYPE = "Ride Standard";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Returns distance in km
};

// Calculate the final fare for a ride, based on distance and vehicle type
const calculateFare = (
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  vehicleType = DEFAULT_VEHICLE_TYPE,
) => {
  const distanceInKm = calculateDistance(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
  );

  const { baseFare, perKmRate } =
    FARE_RATES[vehicleType] || FARE_RATES[DEFAULT_VEHICLE_TYPE];

  const totalFare = baseFare + distanceInKm * perKmRate;

  // Return rounded to 2 decimal places (e.g., 15.45)
  return Math.round(totalFare * 100) / 100;
};

module.exports = {
  calculateFare,
  calculateDistance,
  FARE_RATES,
  DEFAULT_VEHICLE_TYPE,
};
