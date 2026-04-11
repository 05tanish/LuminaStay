import AppError from '../utils/AppError.js'
import { logger } from '../utils/logger.js'

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //  Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    err = new AppError(`Duplicate value for ${field}`, 409);
  }

  //  Prisma record not found
  if (err.code === 'P2025') {
    err = new AppError('Record not found', 404);
  }

  //  Prisma foreign key constraint failure
  if (err.code === 'P2003') {
    err = new AppError('Related record not found', 400);
  }

  //  JWT token errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('Token expired. Please log in again', 401);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    err = new AppError('Validation failed', 400, errors);
  }

  //  Log error details — stack trace in development, message only in production
  if (err.statusCode >= 500) {
    logger.error(err.message, {
      statusCode: err.statusCode,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method
    });
  }

  //  Build response — hide internal details in production
  const response = {
    success: false,
    status: err.status,
    message: err.isOperational ? err.message : 'Something went wrong'
  };

  //  Include validation errors array if present
  if (err.errors) {
    response.errors = err.errors;
  }

  //  Include stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
}

export default globalErrorHandler;
