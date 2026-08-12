// packages/omnitrack-core/driverSchema.js

// Possible Statuses for a Driver
const DRIVER_STATUS = {
  ONLINE: "ONLINE", // Actively looking for rides
  OFFLINE: "OFFLINE", // Not accepting rides
  IN_RIDE: "IN_RIDE", // Currently busy with a trip
};

// The Driver (Partner) Blueprint
const driverBlueprint = {
  _id: "unique_driver_id_string",
  phone: "+919876543211",
  name: "Jane Smith",

  status: DRIVER_STATUS.OFFLINE,

  // Live location tracking (Updated every few seconds via WebSockets)
  currentLocation: {
    type: "Point",
    coordinates: [76.9558, 11.0168],
  },

  // Vehicle Details
  vehicle: {
    tier: "MINI", // Matches the vehicleTier in rideSchema
    model: "Tata Punch",
    licensePlate: "TN-38-AB-1234",
  },

  // KYC and Documents
  kyc: {
    status: "PENDING", // 'PENDING', 'ACTIVE', 'REJECTED'
    licenseUrl: "https://storage.url/license.jpg",
    insuranceUrl: "https://storage.url/insurance.jpg",
    expiryDates: {
      license: new Date("2028-01-01"),
      insurance: new Date("2027-01-01"),
    },
  },

  rating: 4.8,
  walletBalance: 1500.5, // Driver earnings

  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export default { DRIVER_STATUS, driverBlueprint };
