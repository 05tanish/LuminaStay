// Authorization middleware — restricts access based on user roles
import { AppError } from "../utils/AppError.js";

const ROLE_WEIGHTS = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  USER: 1
};

// Middleware factory that checks if current user has the required role
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return next(new AppError("Unauthorized - User role not found", 401));
  }

  if (roles.length === 0) return next();

  const minRequiredWeight = Math.min(...roles.map(r => ROLE_WEIGHTS[r] || Infinity));
  const userWeight = ROLE_WEIGHTS[req.user.role] || 0;

  if (userWeight < minRequiredWeight && !roles.includes(req.user.role)) {
    return next(new AppError("Forbidden - You do not have permission to perform this action", 403));
  }
  
  next();
}
