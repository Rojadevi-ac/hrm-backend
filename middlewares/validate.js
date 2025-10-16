// middlewares/validate.js
/**
 * validate(schema, source)
 * - schema: Joi schema
 * - source: "body" | "query" | "params"
 */
export const validate = (schema, source = "body") => (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false, convert: true });

    if (error) {
        const details = error.details.map((d) => ({ message: d.message, path: d.path }));
        res.status(400);
        return next(new Error(JSON.stringify({ message: "Validation error", details })));
    }
    // attach coerced/validated data back
    req[source] = value;
    return next();
};
