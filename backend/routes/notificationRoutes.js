import express from "express";
const router = express.Router();

import {protect, admin} from "../middlewares/authMiddleware.js";

//Controllers
import {
  getUserNotification,
  markAllNotificationsAsRead,
  clearNotifications,
} from "../controllers/notificationController.js";

//Routes
router.get("/", protect, getUserNotification);
router.get("/readNotification", protect, markAllNotificationsAsRead);
router.get("/clearNotification", protect, clearNotifications);

export default router;
