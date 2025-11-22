// src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// -------------------------------------------------------
// LOGIN CONTROLLER
// -------------------------------------------------------
export const loginUser = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await repo.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check email verification
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified",
      });
    }

    // 4. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // 5. Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );

    // 6. Set the cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // set to true when using HTTPS
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: "/",
    });

    // 7. Respond with success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// -------------------------------------------------------
// GET LOGGED-IN USER PROFILE
// -------------------------------------------------------
export const getProfile = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
    },
  });
};

// -------------------------------------------------------
// LOGOUT CONTROLLER
// -------------------------------------------------------
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // change to true in production
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
