const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    // The dynamic reference setup
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "raisedByModel",
    },
    raisedByModel: {
      type: String,
      required: true,
      enum: ["User", "Driver"], // Must match exactly what you named your models!
    },
    // Dispute Details
    reason: {
      type: String,
      required: true,
      enum: [
        "fare_issue",
        "driver_behavior",
        "rider_behavior",
        "safety_concern",
        "lost_item",
        "other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    // Admin Tracking
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Dispute", disputeSchema);
