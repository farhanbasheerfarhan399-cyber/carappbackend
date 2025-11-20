import express, { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const userRepo = AppDataSource.getRepository(User);

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified. Please verify OTP.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Save cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // set true only in https
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      domain: "localhost",
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
