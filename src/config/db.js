import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger.js";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });

// Logging
prisma.$on("query", (e) => {
  logger.debug(e);
});

prisma.$on("error", (e) => {
  logger.error(e);
});

prisma.$on("info", (e) => {
  logger.info(e);
});

prisma.$on("warn", (e) => {
  logger.warn(e);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
