import express from "express";
const router = express.Router();

import upload from "../util/multer.js";
import {protect, admin} from "../middlewares/authMiddleware.js";

//Controllers
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplier,
} from "../controllers/supplierController.js";

//Routes
router.get("/", protect, getSuppliers);
router.post("/", protect, admin, upload.single("image"), createSupplier);
router.get("/:id", protect, admin, getSupplier);
router.delete("/:id", protect, admin, deleteSupplier);
router.put("/:id", protect, admin, upload.single("image"), updateSupplier);

export default router;
