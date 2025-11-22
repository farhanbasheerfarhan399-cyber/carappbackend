// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ------------------------------
// JWT Payload Type
// ------------------------------
export interface DecodedToken extends JwtPayload {
  id: number;
  fullName: string;
  email: string;
}

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

// ------------------------------
// AUTH MIDDLEWARE
// ------------------------------
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Correct cookie name: must match loginController
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    // Attach decoded payload to req
    req.user = decoded;

    // Continue to the next route/controller
    return next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal authentication error",
    });
  }
};
