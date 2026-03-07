// Authorization middleware — restricts access based on user roles
import AppError from "../utils/AppError.js";

// Middleware factory that checks if current user has the required role
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden - You do not have permission to perform this action", 403))
  }
  next()
}
