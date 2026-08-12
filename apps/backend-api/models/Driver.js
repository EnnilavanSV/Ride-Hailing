const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      select: false,
    },
    phone: {
      type: Number,
      required: [true, "Please add Mobile Number"],
    },
    vehicle: {
      make: { type: String }, // Removed required: true
      model: { type: String }, // Removed required: true
      licensePlate: { type: String }, // Removed required: true
      vehicleColor: { type: String },
    },
    status: {
      type: String,
      enum: [
        "pending_documents",
        "pending_approval",
        "active",
        "rejected",
        "suspended",
      ],
      default: "pending_documents",
    },
    dutyStatus: {
      type: String,
      enum: ["offline", "online", "on_trip"],
      default: "offline",
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

driverSchema.pre("save", async function () {
  //  If password isn't modified, just return to exit the function
  if (!this.isModified("password")) {
    return;
  }

  //  Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
driverSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("Driver", driverSchema);
