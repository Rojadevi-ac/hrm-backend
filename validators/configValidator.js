// validators/configValidator.js
import Joi from "joi";

export const officeConfigSchema = Joi.object({
    latitude: Joi.number().required().messages({
        "any.required": "latitude is required",
        "number.base": "latitude must be a number",
    }),
    longitude: Joi.number().required().messages({
        "any.required": "longitude is required",
        "number.base": "longitude must be a number",
    }),
    radius: Joi.number().required().min(1).messages({
        "any.required": "radius is required",
        "number.base": "radius must be a number (in meters)",
        "number.min": "radius must be greater than 0",
    }),
    // optional business field to detect late arrivals. Format: "HH:MM" 24-hour.
    workStartTime: Joi.string().pattern(/^\d{1,2}:\d{2}$/).optional(),
});
