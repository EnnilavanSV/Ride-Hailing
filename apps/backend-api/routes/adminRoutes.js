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
const validate = require("../middleware/validate");
const {
  suspendDriverValidator,
  mongoIdParamValidator,
} = require("../middleware/validators");

// All routes here require both user authentication AND admin privileges
router.get("/users", protect, admin, getAllUsers);
router.get("/drivers", protect, admin, getAllDrivers);
router.get("/rides", protect, admin, getAllRides);
router.get("/disputes", protect, admin, getAllDisputes);
router.put(
  "/disputes/:id/resolve",
  protect,
  admin,
  validate(mongoIdParamValidator("id")),
  resolveDispute,
);
router.get("/action-queue", protect, admin, getActionQueueStats);
router.get("/drivers/pending", protect, admin, getPendingDrivers);
router.put(
  "/drivers/:id/approve",
  protect,
  admin,
  validate(mongoIdParamValidator("id")),
  approveDriver,
);
router.put(
  "/drivers/:id/reject",
  protect,
  admin,
  validate(mongoIdParamValidator("id")),
  rejectDriver,
);
router.get("/live-map", protect, admin, getLiveLocations);
router
  .route("/profile")
  .get(protect, admin, getAdminProfile)
  .put(protect, admin, updateAdminProfile);
router.put(
  "/drivers/:id/status",
  protect,
  admin,
  validate(suspendDriverValidator),
  suspendDriver,
);

module.exports = router;
