// controllers/disputeController.js
//
// Dispute creation was previously copy-pasted verbatim in both
// userController.js and driverController.js. It's identical logic for both
// actor types (it already branches dynamically on req.user vs req.driver),
// so it now lives in one place and both routers point at it.
const Dispute = require("../models/Dispute");
const redisClient = require("../config/redis");

// @desc    File a dispute against a ride
// @route   POST /api/users/disputes  |  POST /api/drivers/disputes
// @access  Private (rider via `protect`, or driver via `protectDriver`)
const createDispute = async (req, res) => {
  try {
    const { rideId, reason, description } = req.body;

    if (!rideId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a Ride ID, select a reason, and describe the issue.",
      });
    }

    // Dynamically determine who is raising the dispute based on which
    // auth middleware ran (protect -> req.user, protectDriver -> req.driver)
    let raisedBy;
    let raisedByModel;

    if (req.user) {
      raisedBy = req.user._id;
      raisedByModel = "User";
    } else if (req.driver) {
      raisedBy = req.driver._id;
      raisedByModel = "Driver";
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const dispute = await Dispute.create({
      ride: rideId,
      raisedBy,
      raisedByModel,
      reason,
      description,
    });

    await redisClient.del("admin:all_disputes");

    res.status(201).json({
      success: true,
      message:
        "Dispute submitted successfully. Our team will review it shortly.",
      data: dispute,
    });
  } catch (error) {
    console.error(`❌ Create Dispute Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { createDispute };
