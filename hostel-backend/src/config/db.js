import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Create an optimized connection pool — handles connection reuse and limits
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 50,                      // Maximum active connections in pool
  min: 5,                       // Minimum idle connections to keep open
  idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000 // Error out if connection takes > 2 seconds
});

// Prisma v7 requires a driver adapter for relational databases
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
