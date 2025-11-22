import { Router, Request, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware";
import { AppDataSource } from "../config/db";
import { Ride } from "../entities/Ride";
import { User } from "../entities/User";

import { getAllRides } from "../controllers/rideControllers";

const router = Router();

router.post("/publish-ride", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      startingLocation,
      exactPickupPoint,
      destination,
      date,
      time,
      price,
      seats,
    } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const rideRepo = AppDataSource.getRepository(Ride);

    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const ride = rideRepo.create({
      startingLocation,
      exactPickupPoint,
      destination,
      date,
      time,
      price,
      seats,
      user,
    });

    await rideRepo.save(ride);

    res.json({ success: true, ride });

  } catch (error: any) {
    console.error("Publish Ride Error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
});
router.get("/all", getAllRides);   // public API




export default router;
