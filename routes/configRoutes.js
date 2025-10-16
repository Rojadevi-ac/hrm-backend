// routes/configRoutes.js
import express from "express";
import { setOfficeLocation, getOfficeLocation } from "../controllers/configController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { officeConfigSchema } from "../validators/configValidator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Office Configuration
 *   description: APIs for configuring office location and radius
 */

/**
 * @swagger
 * /api/config/office:
 *   post:
 *     summary: Admin - set or update office location & radius
 *     tags: [Office Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - radius
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 12.9716
 *               longitude:
 *                 type: number
 *                 example: 77.5946
 *               radius:
 *                 type: number
 *                 example: 100
 *               workStartTime:
 *                 type: string
 *                 description: Optional "HH:MM" 24h format to detect late entries
 *                 example: "09:30"
 *     responses:
 *       200:
 *         description: Office location set/updated successfully
 *       403:
 *         description: Admin access required
 */
router.post("/office", protect, adminOnly, validate(officeConfigSchema, "body"), setOfficeLocation);

/**
 * @swagger
 * /api/config/office:
 *   get:
 *     summary: Get current office location & radius
 *     tags: [Office Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current office configuration
 */
router.get("/office", protect, getOfficeLocation);

export default router;
