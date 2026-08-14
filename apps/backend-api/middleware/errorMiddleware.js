// middleware/errorMiddleware.js
//
// Centralized error handling: a 404 handler for unmatched routes, and a
// final error handler that gives Mongoose CastError / ValidationError /
// duplicate-key errors a proper 400 response instead of an opaque 500, and
// standardizes the response shape ({ success, message }) for anything that
// reaches it via next(err) rather than being caught locally.

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);

  // Invalid MongoDB ObjectId in a route param (e.g. /api/rides/not-an-id/accept)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Mongoose schema validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", ") || "Validation failed",
    });
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      message: `That ${field} is already in use`,
    });
  }

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Server Error"
        : err.message || "Server Error",
  });
};

module.exports = { notFound, errorHandler };
