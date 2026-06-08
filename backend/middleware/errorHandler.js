// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose Bad ObjectId
  if (err.name === "CastError") {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
    statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    statusCode = 400;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please login again.";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired. Please login again.";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
