// Centralized environment configuration with validation.
// Validates required vars at startup to fail fast rather than at runtime.

const requiredVars = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "GOOGLE_CLIENT_ID",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "FRONTEND_URL"
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

export const IS_PRODUCTION = NODE_ENV === "production";
