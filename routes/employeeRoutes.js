import express from "express";
import { createEmployee, getEmployees } from "../controllers/employeeController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", protect, adminOnly, createEmployee);
router.get("/", protect, adminOnly, getEmployees);

export default router;
