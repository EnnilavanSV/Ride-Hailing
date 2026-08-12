// Convert degrees to radians for the math functions
const toRadians = (degree) => {
  return degree * (Math.PI / 180);
};

// Calculate the final fare
const calculateFare = (pickupLat, pickupLng, dropoffLat, dropoffLng) => {
  const distanceInKm = calculateDistance(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
  );

  // Define your pricing model
  const BASE_FARE = 5.0; // Flat fee for getting in the car
  const PER_KM_RATE = 2.5; // Cost per kilometer traveled

  const totalFare = BASE_FARE + distanceInKm * PER_KM_RATE;

  // Return rounded to 2 decimal places (e.g., 15.45)
  return Math.round(totalFare * 100) / 100;
};

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

module.exports = { calculateFare, calculateDistance };
