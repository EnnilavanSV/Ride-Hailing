// config/cors.js
//
// Single shared list of allowed origins, used by both the Express CORS
// middleware and the Socket.IO CORS config in server.js. Previously this
// list was duplicated in two places and could silently drift apart.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://ride-hailing-rider-app-liard.vercel.app",
  "https://ride-hailing-driver-app-rho.vercel.app",
  "https://ride-hailing-admin-app.vercel.app",
];

module.exports = { allowedOrigins };
