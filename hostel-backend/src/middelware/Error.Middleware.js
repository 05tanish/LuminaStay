import AppError from '../utils/AppError.js'

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Prisma errors (optional but useful)
  if (err.code === 'P2002') {
    err = new AppError('Duplicate field value', 400)
  }

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message
  })
}

export default globalErrorHandler

