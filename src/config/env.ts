import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().optional().default("3000").transform(Number),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.string().optional().default("10").transform(Number),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default("900000")
    .transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .default("100")
    .transform(Number),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Environment validation failed:");
  result.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = result.data;
