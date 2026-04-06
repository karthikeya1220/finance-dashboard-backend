import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDatabase } from "../src/config/database";

// Global connection state
let dbConnected = false;

/**
 * Ensure database is connected before handling requests
 * This prevents connection timeouts in serverless environment
 */
const ensureDbConnection = async () => {
  if (!dbConnected) {
    try {
      await connectDatabase();
      dbConnected = true;
      console.log("✅ Database connected in serverless function");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      dbConnected = false;
      throw error;
    }
  }
};

/**
 * Vercel Serverless Function Handler
 * Entry point for all HTTP requests
 * Routes requests to Express app
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Ensure database connection is established
    await ensureDbConnection();

    // Pass request to Express app
    app(req, res);
  } catch (error) {
    console.error("🔥 Serverless function error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process request",
      timestamp: new Date().toISOString(),
    });
  }
};
