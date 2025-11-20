import express, { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";

const router = express.Router();

// 1. Define the specific payload interface (MUST match what you sign in your login route)
interface DecodedToken extends JwtPayload {
  id: number; // Or string, depending on your User entity's ID type
}

router.get("/profile", async (req, res: Response) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    // 2. Decode and Cast
    // We cast the result to our specific DecodedToken interface
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // The error occurs if the payload is just a string, so we ensure it's an object with 'id'
    if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, message: "Invalid token payload" });
    }
    
    // Now TypeScript knows 'decoded' has 'id'
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ 
        where: { id: decoded.id } // <-- Error fixed here
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    // Better error handling for token issues
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    console.error("Profile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;