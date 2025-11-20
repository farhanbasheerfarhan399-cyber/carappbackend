import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import nodemailer from "nodemailer";

const router = express.Router();
const userRepo = AppDataSource.getRepository(User);

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// SIGNUP + SEND OTP
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // ✅ match entity

    const user = userRepo.create({
      fullName,       // ✅ matches entity
      email,
      phone,
      password: hashedPassword,
      otp,
      otp_expiry,     // ✅ matches entity
      isVerified: false,
    });

    await userRepo.save(user);

    // Send OTP
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    return res.json({ message: "Signup successful. OTP sent to email." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
