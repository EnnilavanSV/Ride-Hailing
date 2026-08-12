const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllDrivers,
  getAllRides,
  getAllDisputes,
  resolveDispute,
  getActionQueueStats,
  getPendingDrivers,
  approveDriver,
  rejectDriver,
  suspendDriver,
  getLiveLocations,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// All routes here require both user authentication AND admin privileges
router.get("/users", protect, admin, getAllUsers);
router.get("/drivers", protect, admin, getAllDrivers);
router.get("/rides", protect, admin, getAllRides);
router.get("/disputes", protect, admin, getAllDisputes);
router.put("/disputes/:id/resolve", protect, admin, resolveDispute);
router.get("/action-queue", protect, admin, getActionQueueStats);
router.get("/drivers/pending", protect, admin, getPendingDrivers);
router.put("/drivers/:id/approve", protect, admin, approveDriver);
router.put("/drivers/:id/reject", protect, admin, rejectDriver);
router.get("/live-map", protect, admin, getLiveLocations);
router
  .route("/profile")
  .get(protect, admin, getAdminProfile)
  .put(protect, admin, updateAdminProfile);
router.put("/drivers/:id/status", protect, admin, suspendDriver);

module.exports = router;
