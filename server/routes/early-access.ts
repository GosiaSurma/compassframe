import { RequestHandler } from "express";
import { EarlyAccessRequest, EarlyAccessResponse } from "@shared/api";
import { addEarlyAccessEmail } from "../lib/database";

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
    const saved = await addEarlyAccessEmail(email.trim().toLowerCase());

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
