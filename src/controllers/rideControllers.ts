// src/controllers/rideControllers.ts

import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Ride } from "../entities/Ride";

export const getAllRides = async (req: Request, res: Response) => {
  try {
    const rideRepo = AppDataSource.getRepository(Ride);

    const rides = await rideRepo
      .createQueryBuilder("ride")
      .select([
        "ride.startingLocation",
        "ride.exactPickupPoint",
        "ride.destination",
        "ride.date",
        "ride.time",
        "ride.price",
        "ride.seats",
        "ride.createdAt",
      ]) // ✅ Only include the fields you want
      .leftJoin("ride.user", "user")
      .addSelect("user.fullName", "user_fullName")
      .getRawMany();

    return res.json({
      success: true,
      rides,
    });

  } catch (error) {
    console.error("Get all rides error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
