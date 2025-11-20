import express, { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import nodemailer from "nodemailer"; // after installing @types/nodemailer

const router = express.Router();
const userRepo = AppDataSource.getRepository("User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/resend-otp", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user: any = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await userRepo.save(user);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New OTP",
      text: `Your new OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({ message: "OTP resent successfully!" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
