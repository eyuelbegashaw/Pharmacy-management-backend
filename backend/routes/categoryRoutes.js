import express from "express";
const router = express.Router();

import {protect, admin} from "../middlewares/authMiddleware.js";

//Controllers
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

router.get("/", protect, getCategories);
router.post("/", protect, admin, createCategory);
router.delete("/:id", protect, admin, deleteCategory);
router.put("/:id", protect, admin, updateCategory);

export default router;
