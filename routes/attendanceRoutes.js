// routes/attendanceRoutes.js
import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
    markAttendance,
    getMyAttendance,
    adminGetAttendance,
    downloadAttendanceReport,
} from "../controllers/attendanceController.js";
import { validate } from "../middlewares/validate.js";
import {
    markAttendanceSchema,
    attendanceQuerySchema,
} from "../validators/attendanceValidator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: APIs for marking and managing attendance
 */

/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Mark employee attendance (Check-in / Check-out)
 *     tags: [Attendance]
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
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 12.9716
 *               longitude:
 *                 type: number
 *                 example: 77.5946
 *               type:
 *                 type: string
 *                 enum: [checkin, checkout, auto]
 *                 example: auto
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Validation or location error
 */
router.post("/mark", protect, validate(markAttendanceSchema, "body"), markAttendance);

/**
 * @swagger
 * /api/attendance/me:
 *   get:
 *     summary: Get logged-in employee's attendance history (paginated)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-10-01
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-10-15
 *     responses:
 *       200:
 *         description: Paginated list of user's attendance
 */
router.get("/me", protect, validate(attendanceQuerySchema, "query"), getMyAttendance);

/**
 * @swagger
 * /api/attendance/admin:
 *   get:
 *     summary: Admin - view all attendance records with filters
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           example: 652bf7a1d3f48b90e4c63c91
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *           example: HR
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-10-15
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: List of attendance records with user info
 *       403:
 *         description: Admin access required
 */
router.get("/admin", protect, adminOnly, validate(attendanceQuerySchema, "query"), adminGetAttendance);

/**
 * @swagger
 * /api/attendance/download:
 *   get:
 *     summary: Admin - download attendance report as CSV or JSON
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           example: csv
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           example: 652bf7a1d3f48b90e4c63c91
 *     responses:
 *       200:
 *         description: Returns attendance as JSON or downloadable CSV
 */
router.get("/download", protect, adminOnly, validate(attendanceQuerySchema, "query"), downloadAttendanceReport);

export default router;
