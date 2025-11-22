import { EntitySchema } from "typeorm";
import { UserType } from "./User";


export interface RideType {
  id: number;
  startingLocation: string;
  exactPickupPoint: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  createdAt: Date;
  user: UserType; // <-- IMPORTANT
}

export const Ride = new EntitySchema<RideType>({
  name: "Ride",
  tableName: "rides",

  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },

    startingLocation: {
      type: String,
      nullable: false,
    },

    exactPickupPoint: {
      type: String,
      nullable: false,
    },

    destination: {
      type: String,
      nullable: false,
    },

    date: {
      type: String,
      nullable: false,
    },

    time: {
      type: String,
      nullable: false,
    },

    price: {
      type: Number,
      nullable: false,
    },

    seats: {
      type: Number,
      nullable: false,
    },

    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },

  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "rides",
      joinColumn: true,
      nullable: false,
    },
  },
});
