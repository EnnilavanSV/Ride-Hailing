// packages/omnitrack-core/socketContracts.js

//  Event Names (Constants prevent typos between frontend and backend)
const SOCKET_EVENTS = {
  // Driver sending to Server
  UPDATE_LOCATION: "UPDATE_LOCATION",

  // Server sending to Driver
  INCOMING_RIDE: "INCOMING_RIDE",

  // Server sending to Rider
  RIDE_MATCHED: "RIDE_MATCHED",
  DRIVER_LOCATION_UPDATED: "DRIVER_LOCATION_UPDATED",
  RIDE_STATUS_CHANGED: "RIDE_STATUS_CHANGED",
};

//  Blueprint: What the Driver App sends continuously (e.g., every 5 seconds)
const updateLocationPayload = {
  driverId: "driver_id_123",
  location: {
    type: "Point",
    coordinates: [76.9558, 11.0168], // [longitude, latitude]
  },
};

//  Blueprint: What the Server pushes to a Driver when a rider requests a trip
const incomingRidePayload = {
  rideId: "ride_id_456",
  pickup: {
    coordinates: [76.9558, 11.0168],
    address: "123 Main St",
  },
  estimatedEarnings: 200, // Driver's cut of the fare
  countdownSeconds: 15, // The 15-second "Accept/Decline" timer
};

//  Blueprint: What the Server pushes to the Rider when a driver taps "Accept"
const rideMatchedPayload = {
  rideId: "ride_id_456",
  driver: {
    name: "Jane Smith",
    rating: 4.8,
    vehicle: {
      model: "Tata Punch",
      licensePlate: "TN-38-AB-1234",
    },
    // The rider's app will use this to immediately drop the car pin on the map
    currentLocation: {
      coordinates: [77.0, 11.05],
    },
  },
};

export default {
  SOCKET_EVENTS,
  updateLocationPayload,
  incomingRidePayload,
  rideMatchedPayload,
};
