import express from "express";
const router = express.Router();

import {protect, admin} from "../middlewares/authMiddleware.js";

//Controllers
import {
  getDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
  getDrug,
  drugsExpiringSoon,
  expiredDrugs,
  lowStockDrugs,
  dailyStock,
} from "../controllers/drugController.js";

//Routes
router.get("/", protect, getDrugs);
router.put("/dailyStock", protect, dailyStock);

router.get("/expiredDrugs", protect, expiredDrugs);
router.put("/drugsExpiringSoon", protect, drugsExpiringSoon);
router.put("/lowStockDrugs", protect, lowStockDrugs);

router.post("/", protect, createDrug);
router.get("/:id", protect, getDrug);
router.delete("/:id", protect, admin, deleteDrug);
router.put("/:id", protect, admin, updateDrug);

export default router;
