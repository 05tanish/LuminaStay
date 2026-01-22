// role based acess 
import AppError from "../utils/AppError";

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403))
  }
  next()
}
