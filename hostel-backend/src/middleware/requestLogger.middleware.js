//  Request logging middleware — logs incoming requests and outgoing responses
// with timing information. Essential for debugging, monitoring, and production observability.

import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // [REVIEW] Log when response finishes (not when request arrives)
  // to capture the status code and timing
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent")
    };

    // [REVIEW] Use different log levels based on response status
    if (res.statusCode >= 500) {
      logger.error("Request failed", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Client error", logData);
    } else {
      logger.info("Request completed", logData);
    }
  });

  next();
};
