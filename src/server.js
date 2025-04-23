import "dotenv/config";
import express from "express";
import cors from "cors";
import logger from "./utils/logger.js";
import prisma from "./config/db.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/v1/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    logger.error("Database connection failed:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
