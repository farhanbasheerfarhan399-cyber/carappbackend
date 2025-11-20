import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
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
      nullable: false,   // consistent with signup controller
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
      nullable: true,
    },

    otp_expiry: {
      type: "timestamp",
      nullable: true,
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
});
