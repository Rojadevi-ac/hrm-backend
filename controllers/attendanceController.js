// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import OfficeConfig from "../models/OfficeConfig.js";
import User from "../models/User.js";
import { isWithinRadius } from "../utils/haversine.js";
import { Parser as Json2CsvParser } from "json2csv";
import mongoose from "mongoose";

/**
 * POST /api/attendance/mark
 * Body: { latitude, longitude, type?: "checkin"|"checkout" }
 * - Validates location against office radius
 * - Creates a new attendance doc for the day with checkIn
 * - Updates existing day's doc with checkOut
 * - Marks "Late" if office.workStartTime exists and checkIn > workStartTime
 */
export const markAttendance = async (req, res, next) => {
    try {
        const user = req.user;
        const { latitude, longitude, type = "auto" } = req.body;

        // Get office configuration
        const office = await OfficeConfig.findOne();
        if (!office || !office.officeLocation) {
            return res.status(400).json({ success: false, message: "Office location not set" });
        }

        // Validate if user is within allowed radius
        const inside = isWithinRadius(office.officeLocation, { latitude, longitude });
        if (!inside) {
            return res.status(400).json({ success: false, message: "Outside office radius" });
        }

        // Date range for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        // Find today's attendance
        let attendance = await Attendance.findOne({
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
        });

        const now = new Date();

        if (!attendance) {
            // Create a new attendance entry (Check-in)
            const newAtt = new Attendance({
                user: user._id,
                date: startOfDay,
                checkIn: now,
                location: { latitude, longitude },
                status: "Present",
            });

            // Optional: detect late arrivals
            if (office.workStartTime) {
                const [hh, mm] = office.workStartTime.split(":").map(Number);
                const workStart = new Date(startOfDay);
                workStart.setHours(hh, mm, 0, 0);
                if (now > workStart) newAtt.status = "Late";
            }

            attendance = await newAtt.save();
            return res.json({ success: true, message: "Checked in successfully", data: attendance });
        } else {
            // Existing entry: perform Check-out
            if (attendance.checkOut) {
                return res.status(400).json({ success: false, message: "Already checked out today" });
            }

            attendance.checkOut = now;
            attendance.location = { latitude, longitude };

            await attendance.save();
            return res.json({ success: true, message: "Checked out successfully", data: attendance });
        }
    } catch (err) {
        console.error("Error marking attendance:", err);
        next(err);
    }
};

/**
 * GET /api/attendance/me
 * Query: page, limit, from, to
 * Returns paginated attendance documents for the requesting user
 */
export const getMyAttendance = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
        const from = req.query.from ? new Date(req.query.from) : null;
        const to = req.query.to ? new Date(req.query.to) : null;

        const filter = { user: userId };
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from.setHours(0, 0, 0, 0));
            if (to) filter.date.$lte = new Date(to.setHours(23, 59, 59, 999));
        }

        const total = await Attendance.countDocuments(filter);
        const docs = await Attendance.find(filter)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return res.json({
            success: true,
            page,
            limit,
            total,
            data: docs,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/attendance/admin
 * Admin-only: query by employeeId, department, date, from, to
 * Returns attendance data with pagination and filtering.
 */
export const adminGetAttendance = async (req, res, next) => {
    try {
        const { employeeId, department, date, from, to } = req.query;
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.min(200, parseInt(req.query.limit || "20", 10));
        const filter = {};

        // Employee filter
        if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
            filter.user = new mongoose.Types.ObjectId(employeeId);
        }

        // Date or range filters
        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            filter.date = { $gte: d, $lt: next };
        } else if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(new Date(from).setHours(0, 0, 0, 0));
            if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
        }

        // Aggregate pipeline for department-based filtering
        let pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
            { $unwind: "$userInfo" },
        ];

        if (department) {
            pipeline.push({ $match: { "userInfo.department": department } });
        }

        // Total count
        const totalDocs = await Attendance.aggregate([...pipeline, { $count: "total" }]);
        const total = totalDocs[0]?.total || 0;

        // Pagination + Projection
        pipeline.push({ $sort: { date: -1 } });
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
        pipeline.push({
            $project: {
                user: 1,
                date: 1,
                checkIn: 1,
                checkOut: 1,
                location: 1,
                status: 1,
                "userInfo.name": 1,
                "userInfo.email": 1,
                "userInfo.department": 1,
                "userInfo.designation": 1,
            },
        });

        const records = await Attendance.aggregate(pipeline);

        return res.json({
            success: true,
            page,
            limit,
            total,
            data: records,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/attendance/download
 * Admin-only: format=csv|json, from, to, employeeId
 * Returns attendance report as CSV or JSON.
 */
export const downloadAttendanceReport = async (req, res, next) => {
    try {
        const { format = "json", employeeId, from, to } = req.query;
        const filter = {};

        if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
            filter.user = new mongoose.Types.ObjectId(employeeId);
        }
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(new Date(from).setHours(0, 0, 0, 0));
            if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
        }

        const docs = await Attendance.find(filter)
            .populate({ path: "user", select: "name email department designation" })
            .sort({ date: -1 })
            .lean();

        const data = docs.map((d) => ({
            id: d._id.toString(),
            date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
            name: d.user?.name || "",
            email: d.user?.email || "",
            department: d.user?.department || "",
            designation: d.user?.designation || "",
            checkIn: d.checkIn ? new Date(d.checkIn).toISOString() : "",
            checkOut: d.checkOut ? new Date(d.checkOut).toISOString() : "",
            status: d.status || "",
            latitude: d.location?.latitude ?? "",
            longitude: d.location?.longitude ?? "",
        }));

        if (format.toLowerCase() === "csv") {
            const fields = Object.keys(data[0] || {});
            const parser = new Json2CsvParser({ fields });
            const csv = parser.parse(data);

            res.setHeader("Content-Disposition", `attachment; filename=attendance_${Date.now()}.csv`);
            res.setHeader("Content-Type", "text/csv");
            return res.send(csv);
        }

        return res.json({ success: true, total: data.length, data });
    } catch (err) {
        next(err);
    }
};
