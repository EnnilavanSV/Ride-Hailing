// packages/omnitrack-core/apiContracts.js

//  Core Endpoints
const API_ENDPOINTS = {
  ESTIMATE_FARE: '/api/v1/rides/estimate',
  BOOK_RIDE: '/api/v1/rides/book',
  CANCEL_RIDE: '/api/v1/rides/cancel'
};

//  Request Blueprint: What the Frontend sends to the Backend to book a ride
const bookRideRequestBlueprint = {
  riderId: "user_id_string",
  pickup: {
    coordinates: [76.9558, 11.0168], // [longitude, latitude]
    address: "123 Main St"
  },
  dropoff: {
    coordinates: [77.0000, 11.0500],
    address: "456 Destination Ave"
  },
  vehicleTier: "MINI", // e.g., 'AUTO', 'MINI', 'SUV'
  paymentMethod: "WALLET"
};

//  Success Blueprint: What the Backend replies with if booking is successful
const bookRideSuccessResponse = {
  success: true,
  message: "Ride requested successfully. Searching for drivers.",
  data: {
    rideId: "unique_ride_id_string",
    status: "SEARCHING",
    estimatedFare: 250
  }
};

// Error Blueprint: Standardized error format for the entire application
const errorResponseBlueprint = {
  success: false,
  error: {
    code: "INSUFFICIENT_FUNDS",
    message: "Your wallet balance is too low to request this ride."
  }
};

export default { 
  API_ENDPOINTS, 
  bookRideRequestBlueprint, 
  bookRideSuccessResponse, 
  errorResponseBlueprint 
};