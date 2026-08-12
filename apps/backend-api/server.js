const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const morgan = require("morgan");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

const {
  globalLimiter,
  authLimiter,
  pollingLimiter,
} = require("./middleware/rateLimiter");

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
connectDB();
require("./config/redis");

const rideRoutes = require("./routes/rideRoutes");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api", globalLimiter);

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/drivers/login", authLimiter);
app.use("/api/drivers/register", authLimiter);

app.use("/api/admin/live-map", pollingLimiter);

app.use("/api/rides", rideRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OmniTrack Backend API is running smoothly.",
    timestamp: new Date().toISOString(),
  });
});

//Create an HTTP server using the Express app
const server = http.createServer(app);

//Initialize Socket.io attached to the HTTP server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

app.set("io", io);

//Listen for incoming client connections
io.on("connection", (socket) => {
  console.log(`🔌 New WebSockets client connected: ${socket.id}`);
  // Rider joins their personal room to listen for updates
  socket.on("joinUserRoom", (userData) => {
    const cleanId =
      typeof userData === "object" && userData !== null
        ? userData._id || userData.id
        : userData;
    const roomName = `user_${cleanId}`;
    socket.join(roomName);
    console.log(`🏠 Client ${socket.id} joined room: ${roomName}`);
  });

  socket.on("joinDriverRoom", (driverData) => {
    const cleanId =
      typeof driverData === "object" && driverData !== null
        ? driverData._id || driverData.id
        : driverData;
    const roomName = `driver_${cleanId}`;
    socket.join(roomName);
    console.log(`🚖 Driver ${socket.id} joined room: ${roomName}`);
  });

  //Listen for continuous location updates from the Driver
  socket.on("driverLocationUpdate", async (data) => {
    const { driverId, riderId, lat, lng } = data;
    //Instantly forward the coordinates to the rider's room
    if (riderId) {
      io.to(`user_${riderId}`).emit("liveLocation", {
        driverId,
        lat,
        lng,
      });
    }

    try {
      const Driver = require("./models/Driver");
      await Driver.findByIdAndUpdate(driverId, {
        currentLocation: { lat, lng },
      });
    } catch (error) {
      console.error("❌ DB Location Update Error:", error.message);
    }
  });

  // Listen for the client disconnecting
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend Server is listening on port ${PORT}`);
});
