// controllers/configController.js
import OfficeConfig from "../models/OfficeConfig.js";

/**
 * POST /api/config/office
 * Body: { latitude, longitude, radius }
 * Admin only: create or update the office location and radius (meters)
 */
export const setOfficeLocation = async (req, res, next) => {
    try {
        const { latitude, longitude, radius } = req.body;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            typeof radius !== "number" ||
            radius <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payload. latitude, longitude and radius (meters) required.",
            });
        }

        // Keep a single document for office config. Upsert semantics.
        const updated = await OfficeConfig.findOneAndUpdate(
            {},
            { officeLocation: { latitude, longitude, radius } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            message: "Office location set/updated successfully.",
            data: updated,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/config/office
 * Public to authenticated users — returns current office location & radius
 */
export const getOfficeLocation = async (req, res, next) => {
    try {
        const config = await OfficeConfig.findOne();
        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Office location not configured yet.",
            });
        }

        res.json({
            success: true,
            data: config,
        });
    } catch (err) {
        next(err);
    }
};
