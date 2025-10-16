// middlewares/errorHandler.js

/**
 * Standardized error handler for Express.
 * Use: app.use(errorHandler);
 *
 * Response shape:
 * {
 *   success: false,
 *   message: "Short message",
 *   errors: optional more details,
 *   stack: (only in non-production)
 * }
 */

export const errorHandler = (err, req, res, next) => {
    console.error(err); // keep server logs

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    const payload = {
        success: false,
        message: err.message || "Server Error",
    };

    // mongoose validation errors (common case)
    if (err.name === "ValidationError" && err.errors) {
        payload.errors = Object.keys(err.errors).map((k) => ({
            field: k,
            message: err.errors[k].message,
        }));
    }

    // duplicate key (unique) error from Mongo
    if (err.code && err.code === 11000) {
        payload.message = "Duplicate key error";
        payload.errors = Object.keys(err.keyValue).map((k) => ({
            field: k,
            value: err.keyValue[k],
        }));
    }

    // include stacktrace in non-production for easier debugging
    if (process.env.NODE_ENV !== "production") {
        payload.stack = err.stack;
    }

    res.status(statusCode).json(payload);
};
