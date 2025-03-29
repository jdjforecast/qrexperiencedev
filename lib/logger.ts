// Create a logger utility
const isDev = process.env.NODE_ENV === "development"

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug("[DEBUG]", ...args)
    }
  },
  info: (...args: any[]) => {
    console.info("[INFO]", ...args)
  },
  warn: (...args: any[]) => {
    console.warn("[WARN]", ...args)
  },
  error: (...args: any[]) => {
    console.error("[ERROR]", ...args)
  },
}

// Usage:
import { logger } from "@/lib/logger"

// Replace console.log with:
logger.debug("User authentication started", { email })

