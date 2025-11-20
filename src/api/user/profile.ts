import express, { Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/db";
import { User } from "../../entities/User";

const router = express.Router();

// Define a type for the decoded JWT payload
interface TokenPayload {
  id: number; // Assuming user ID is a number
}

// Use a type guard for better error handling in the catch block
router.get("/profile", async (req, res: Response) => {
  try {
    const token = req.cookies.token;

    // 1. Check for Token (Authentication Failure)
    if (!token) {
      // Use 401 Unauthorized when authentication data (token) is missing
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // 2. Verify Token (Authentication/Validation Failure)
    const decoded: TokenPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: decoded.id },
      // OPTIONAL: select only necessary fields to improve security/performance
      select: ["id", "fullName", "email"], 
    });

    // 3. Check for User Existence
    if (!user) {
      // Use 404 Not Found if the token is valid but the user doesn't exist
      // or 401 if you want to invalidate the token implicitly. 404 is often cleaner.
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 4. Success Response (200 OK)
    return res.status(200).json({
      success: true,
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    // 5. Handle Token Errors (e.g., Expired, Invalid Signature)
    if (error instanceof jwt.JsonWebTokenError) {
      // Use 401 Unauthorized for invalid or expired tokens
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    
    // Use 500 Internal Server Error for other unexpected errors (e.g., DB connection)
    console.error("Profile fetch error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;