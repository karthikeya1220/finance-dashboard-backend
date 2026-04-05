import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🗄️  Database: connected`);
    });

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", async () => {
      console.log("Shutting down gracefully...");
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

    // Graceful shutdown on SIGINT (Ctrl+C)
    process.on("SIGINT", async () => {
      console.log("Shutting down gracefully...");
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

    // Handle unhandledRejection
    process.on("unhandledRejection", async (reason: Error) => {
      console.error("Unhandled Rejection:", reason);
      process.emit("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
