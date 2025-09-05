import express from "express";
import mongoose from "mongoose";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

// Validation middleware for ObjectId parameters
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  console.log("Validating ID parameter:", id);

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

// Routes
router.get("/users", protectRoute, getUsersForSidebar);

// Add validation middleware before the controller
router.get("/:id", protectRoute, validateObjectId, getMessages);
router.post("/send/:id", protectRoute, validateObjectId, sendMessage);

export default router;
