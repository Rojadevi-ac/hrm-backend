// validators/attendanceValidator.js
import Joi from "joi";

export const markAttendanceSchema = Joi.object({
  latitude: Joi.number().required().messages({
    "any.required": "latitude is required",
    "number.base": "latitude must be a number",
  }),
  longitude: Joi.number().required().messages({
    "any.required": "longitude is required",
    "number.base": "longitude must be a number",
  }),
  type: Joi.string().valid("checkin", "checkout", "auto").optional(),
});

export const attendanceQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(500).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  date: Joi.date().iso().optional(),
  employeeId: Joi.string().optional(),
  department: Joi.string().optional(),
  format: Joi.string().valid("json", "csv").optional(),
});
