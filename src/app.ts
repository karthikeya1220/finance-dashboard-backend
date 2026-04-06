import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import swaggerSpec from "./config/swagger";
import { errorMiddleware } from "./middleware/error.middleware";
import { ApiResponse } from "./utils/ApiResponse";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import categoriesRoutes from "./modules/categories/categories.routes";
import transactionsRoutes from "./modules/transactions/transactions.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - validate CORS_ORIGIN in production
const getCorsOrigin = (): string | RegExp | (string | RegExp)[] => {
  if (env.NODE_ENV === "production") {
    const corsOrigin = process.env.CORS_ORIGIN;
    if (!corsOrigin) {
      console.warn(
        "⚠️  CORS_ORIGIN not set in production. Defaulting to http://localhost:3000. Set CORS_ORIGIN environment variable."
      );
      return "http://localhost:3000";
    }
    // Support comma-separated origins
    return corsOrigin.includes(",") ? corsOrigin.split(",").map(o => o.trim()) : corsOrigin;
  }
  return "*"; // Allow all in development
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting - apply different limits to different routes
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  handler: (req, res) => {
    const response = new ApiResponse(429, "Too many requests");
    res.status(response.statusCode).json(response);
  },
  skip: (req) => {
    // Skip rate limiting for health checks in development
    if (env.NODE_ENV === "development" && req.path === `${env.API_PREFIX}/health`) {
      return true;
    }
    return false;
  },
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per 15 minutes
  handler: (req, res) => {
    const response = new ApiResponse(429, "Too many login attempts. Please try again later.");
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

// Health check endpoint - use API_PREFIX consistently
app.get(`${env.API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

// Serve Swagger UI assets with proper static middleware
app.use(`${env.API_PREFIX}/docs`, express.static("node_modules/swagger-ui-dist"));

// Swagger Documentation UI
app.use(
  `${env.API_PREFIX}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: false,
    },
    customCss: ".swagger-ui { margin: 0; padding: 0; }",
  })
);

// API routes with appropriate rate limiters
app.use(`${env.API_PREFIX}/auth`, authLimiter, authRoutes); // Stricter limit for auth
app.use(`${env.API_PREFIX}/users`, usersRoutes);
app.use(`${env.API_PREFIX}/categories`, categoriesRoutes);
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
