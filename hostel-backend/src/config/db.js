import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "../utils/logger.js";

// Create an optimized connection pool — handles connection reuse and limits
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                      // Maximum active connections in pool (reduced from 50)
  min: 2,                       // Minimum idle connections to keep open (reduced from 5)
  idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Error out if connection takes > 10 seconds
  keepAlive: true,              // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 10000,
  ssl: {
    rejectUnauthorized: false   // Required for Neon serverless connections
  }
});

// Test the connection on startup
pool.connect()
  .then(client => {
    logger.info('PostgreSQL connection test successful');
    client.release();
  })
  .catch(err => {
    logger.error('PostgreSQL connection test failed', { error: err.message });
  });

pool.on('connect', () => {
  logger.info('PostgreSQL pool client connected');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error', { error: err.message });
});

// Prisma v7 requires a driver adapter for relational databases
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});
