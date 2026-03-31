import AppError from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.errors.map((err) => ({
            field: err.path[0],
            message: err.message
        }));

        return next(
            new AppError("Validation failed", 400, errors)
        );
    }

    req.validatedData = result.data;
    next();
};