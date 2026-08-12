// packages/omnitrack-core/userSchema.js

// The User (Rider) Blueprint
const userBlueprint = {
  _id: "unique_user_id_string",
  phone: "+919876543210",
  email: "rider@example.com",
  name: "John Doe",
  profilePicture: "https://storage.url/avatar.jpg",

  // Saved addresses for quick booking
  savedLocations: {
    home: {
      type: "Point",
      coordinates: [76.9558, 11.0168],
      address: "123 Main St",
    },
    work: null, // Null if the user hasn't set it yet
  },

  walletBalance: 0.0,

  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export default { userBlueprint };
