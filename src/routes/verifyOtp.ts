import express, { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";

const router = express.Router();

const userRepo = AppDataSource.getRepository(User);

router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otp_expiry && user.otp_expiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otp_expiry = null;

    await userRepo.save(user);

    return res.json({
      success: true,                 // ✅ This tells frontend to redirect
      message: "OTP verified successfully",
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
