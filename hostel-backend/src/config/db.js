import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";

export const prisma = new PrismaClient({
  adapter: {
    provider: "postgres",
    url: process.env.DATABASE_URL,
  },
});
