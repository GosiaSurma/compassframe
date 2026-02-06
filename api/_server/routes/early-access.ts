import { RequestHandler } from "express";
import { EarlyAccessRequest, EarlyAccessResponse } from "@shared/api";
import { addEarlyAccessEmail, isDatabaseEnabled } from "../lib/database.js";

const DATABASE_TIMEOUT_MS = Number(process.env.DATABASE_TIMEOUT_MS || 4000);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("database timeout")), ms);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const handleEarlyAccess: RequestHandler<
  unknown,
  EarlyAccessResponse,
  EarlyAccessRequest
> = async (req, res) => {
  const { email } = req.body;

  try {
    if (!isDatabaseEnabled()) {
      return res.status(200).json({
        success: true,
        message: "Email captured (demo mode, not stored)",
      });
    }

    // Validate email exists
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Save email to PostgreSQL database
    const saved = await withTimeout(
      addEarlyAccessEmail(email.trim().toLowerCase()),
      DATABASE_TIMEOUT_MS
    );

    if (saved) {
      res.status(201).json({
        success: true,
        message: "Email added to early access list",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Email already registered",
      });
    }
  } catch (error) {
    console.error("Error in early access handler:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
