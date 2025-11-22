import { EntitySchema } from "typeorm";
import { RideType } from "./Ride";

export interface UserType {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  password: string;

  otp: string | null;           // ✅ FIXED
  otp_expiry: Date | null;      // ✅ FIXED

  isVerified: boolean;
  createdAt: Date;

  rides: RideType[];             // One-to-Many relation
}

export const User = new EntitySchema<UserType>({
  name: "User",
  tableName: "users",

  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },

    fullName: {
      type: String,
      nullable: false,
    },

    email: {
      type: String,
      unique: true,
      nullable: false,
    },

    phone: {
      type: String,
      nullable: false,
    },

    password: {
      type: "text",
      nullable: false,
    },

    otp: {
      type: String,
      nullable: true,        // DB can store null
    },

    otp_expiry: {
      type: "timestamp",
      nullable: true,        // DB can store null
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },

  relations: {
    rides: {
      type: "one-to-many",
      target: "Ride",
      inverseSide: "user",
    },
  },
});
