import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { ApiResponse } from "./utils/ApiResponse";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import transactionsRoutes from "./modules/transactions/transactions.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions =
  env.NODE_ENV === "production"
    ? {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
      }
    : { origin: "*" };
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  handler: (req, res) => {
    const response = new ApiResponse(429, "Too many requests");
    res.status(response.statusCode).json(response);
  },
});
app.use(limiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(
  morgan(env.NODE_ENV === "development" ? "dev" : "combined")
);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

// API routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/users`, usersRoutes);
app.use(`${env.API_PREFIX}/transactions`, transactionsRoutes);
app.use(`${env.API_PREFIX}/dashboard`, dashboardRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  const response = new ApiResponse(404, "Route not found");
  res.status(response.statusCode).json(response);
});

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
