import express from "express";
const router = express.Router();

import {protect, admin} from "../middlewares/authMiddleware.js";

import {
  loginUser,
  registerUser,
  getProfile,
  getAllUsers,
  updateProfile,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
  checkLink,
} from "../controllers/userController.js";

router.get("/", protect, admin, getAllUsers);
router.put("/profile", protect, updateProfile);
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.put("/checkLink", checkLink);

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/profile", protect, getProfile);

router.delete("/:id", protect, admin, deleteUser);
router.put("/:id", protect, admin, updateUser);

export default router;
