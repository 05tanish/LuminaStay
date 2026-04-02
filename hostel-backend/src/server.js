import "dotenv/config";
import App from './app.js'
import { PORT } from './config/env.js'
import { prisma } from './config/db.js'
import { redis } from './config/redis.js'
import { logger } from './utils/logger.js'

const server = App.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || "development" });
});

const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  //  Set a timeout to force exit if cleanup takes too long
  const forceExitTimeout = setTimeout(() => {
    logger.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000); // 10 second timeout

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      //  prisma was referenced but never imported — now properly imported
      await prisma.$disconnect();
      logger.info("Database disconnected");

      //  Also disconnect Redis during shutdown
      redis.disconnect();
      logger.info("Redis disconnected");

      clearTimeout(forceExitTimeout);
      process.exit(0);
    } catch (err) {
      logger.error("Shutdown error", { error: err.message });
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

//  Catch unhandled promise rejections — prevents silent failures
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason: reason?.message || reason });
});

//  Catch uncaught exceptions — log and exit since state is unreliable
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err.message, stack: err.stack });
  process.exit(1);
});