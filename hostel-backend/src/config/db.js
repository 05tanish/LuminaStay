import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Create a connection pool — handles connection reuse and limits
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Prisma v7 requires a driver adapter for relational databases
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
