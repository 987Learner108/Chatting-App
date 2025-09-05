import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./src/lib/db.js";
import { app, server } from "./src/lib/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

console.log("Starting server setup...");

// Debug function to wrap route registration
// const debugRouteRegistration = (app) => {
//   const originalUse = app.use;
//
//   app.use = function (path, ...handlers) {
//     if (typeof path === "string") {
//       console.log("Registering route/middleware:", path);
//     } else {
//       console.log("Registering global middleware");
//     }
//     try {
//       return originalUse.call(this, path, ...handlers);
//     } catch (error) {
//       console.error(
//         "Error registering route/middleware:",
//         typeof path === "string" ? path : "global",
//         error.message
//       );
//       throw error;
//     }
//   };
// };

// // Enable debug logging
// debugRouteRegistration(app);

console.log("Setting up middleware...");

// Middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL]
      : "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

console.log("Middleware setup complete, importing routes...");

// Import routes with error handling
let authRoutes, messageRoutes;

try {
  console.log("Importing auth routes...");
  authRoutes = (await import("./src/routes/auth.route.js")).default;
  console.log("Auth routes imported successfully");
} catch (error) {
  console.error("Error importing auth routes:", error);
  process.exit(1);
}

try {
  console.log("Importing message routes...");
  messageRoutes = (await import("./src/routes/message.route.js")).default;
  console.log("Message routes imported successfully");
} catch (error) {
  console.error("Error importing message routes:", error);
  process.exit(1);
}

console.log("Registering routes...");

try {
  console.log("Registering /api/auth routes...");
  app.use("/api/auth", authRoutes);
  console.log("Auth routes registered successfully");
} catch (error) {
  console.error("Error registering auth routes:", error);
  process.exit(1);
}

try {
  console.log("Registering /api/messages routes...");
  app.use("/api/messages", messageRoutes);
  console.log("Message routes registered successfully");
} catch (error) {
  console.error("Error registering message routes:", error);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express error handler:", err);

  if (err.message && err.message.includes("Missing parameter name")) {
    console.error("Path-to-regexp error detected:", err.message);
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
});

// Production static files
if (process.env.NODE_ENV === "production") {
  // app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

console.log("Starting server...");

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  connectDB();
});
