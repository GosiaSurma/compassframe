import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.ts";
import { handleEarlyAccess } from "./routes/early-access.ts";
import { loopRouter } from "./routes/loop.ts";
import { initializeDatabase } from "./lib/database.ts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on startup
  if (process.env.DATABASE_URL) {
    initializeDatabase().catch((error) => {
      console.warn("Database initialization failed (running in Memory Mode):", error.message);
      // Don't exit, allow server to continue using MemStorage
    });
  } else {
    console.warn("DATABASE_URL not set. Database features will not work.");
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
