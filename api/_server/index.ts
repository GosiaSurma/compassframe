import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { handleEarlyAccess } from "./routes/early-access.js";
import { loopRouter } from "./routes/loop.js";
import { initializeDatabase, isDatabaseEnabled } from "./lib/database.js";

function shouldInitializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!isDatabaseEnabled()) return false;

  if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/i.test(databaseUrl)) {
    console.warn("DATABASE_URL points to localhost in production. Skipping database init.");
    return false;
  }

  return true;
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on startup
  if (shouldInitializeDatabase()) {
    initializeDatabase().catch((error) => {
      console.warn("Database initialization failed (running in Memory Mode):", error.message);
      // Don't exit, allow server to continue using MemStorage
    });
  } else {
    console.warn("Database disabled. Using memory storage.");
  }

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.use(loopRouter);

  // Early access email signup
  app.post("/api/early-access", handleEarlyAccess);

  return app;
}
