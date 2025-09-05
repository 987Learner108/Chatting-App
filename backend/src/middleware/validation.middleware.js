import mongoose from "mongoose";

export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  console.log("Validating ID parameter:", id); // Debug log

  // Check if ID exists and is not empty
  if (!id || id.trim() === "") {
    console.log("Empty ID parameter received");
    return res.status(400).json({ message: "ID parameter is required" });
  }

  // Check for common invalid values
  if (id === "undefined" || id === "null" || id === "NaN") {
    console.log("Invalid ID value received:", id);
    return res.status(400).json({ message: "Invalid ID parameter" });
  }

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid ObjectId format:", id);
    return res.status(400).json({ message: "Invalid ID format" });
  }

  next();
};

// Additional middleware to handle route errors
export const handleRouteErrors = (err, req, res, next) => {
  console.error("Route error:", err);

  if (err.message && err.message.includes("Missing parameter name")) {
    return res.status(400).json({
      message: "Invalid route parameter",
      error: "Bad request format",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};
