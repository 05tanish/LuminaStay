import { AppError } from "../utils/AppError.js";

// Validates req.body against a Zod schema
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }));

        return next(
            new AppError("Validation failed", 400, errors)
        );
    }

    req.validatedData = result.data;
    next();
};

// Validates req.params against a Zod schema
export const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }));

        return next(
            new AppError("Invalid URL parameters", 400, errors)
        );
    }

    next();
};

// Validates req.query against a Zod schema
export const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }));

        return next(
            new AppError("Invalid query parameters", 400, errors)
        );
    }

    next();
};