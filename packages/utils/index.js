// packages/utils/index.js

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

// NEW: Export a function to generate the dynamic ride options
export const generateRideOptions = (distanceInKm) => {
  // Define base rates and per-kilometer rates
  const baseFare = 50;
  const rates = {
    standard: 12, // ₹12 per km
    premium: 22, // ₹22 per km
    xl: 30, // ₹30 per km
  };

  return [
    {
      id: "standard",
      name: "Ride Standard",
      time: "3 min away", // In a production app, this would use a routing API
      price: baseFare + distanceInKm * rates.standard,
      capacity: 4,
    },
    {
      id: "premium",
      name: "Ride Premium",
      time: "5 min away",
      price: baseFare + distanceInKm * rates.premium,
      capacity: 4,
    },
    {
      id: "xl",
      name: "Ride XL",
      time: "8 min away",
      price: baseFare + distanceInKm * rates.xl,
      capacity: 6,
    },
  ];
};
