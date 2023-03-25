import express from "express";
const router = express.Router();

import {protect, admin} from "../middlewares/authMiddleware.js";

//Controllers
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransaction,
  dailyTransaction,
} from "../controllers/transactionController.js";

//Routes
router.put("/daily", protect, dailyTransaction);
router.get("/", protect, getTransactions);
router.post("/", protect, createTransaction);

router.get("/:id", protect, getTransaction);
router.delete("/:id", protect, deleteTransaction);
router.put("/:id", protect, updateTransaction);

export default router;
