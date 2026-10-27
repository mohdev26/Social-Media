import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve("./config/dev.env") });

export const env = {
  PORT: Number(process.env.PORT) || 3255,
  MODE: process.env.NODE || "development",
  APPLICATION_NAME: process.env.APPLICATION_NAME || "Social Media",

  MONGO_URI: process.env.MONGO_URI as string,

  SALT: process.env.SALT || 21,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORt: Number(process.env.EMAIL_PORT) || 587,

  ACCESS_USER_SIGNATURE: process.env.ACCESS_USER_SIGNATURE as string,
  ACCESS_ADMIN_SIGNATURE: process.env.ACCESS_ADMIN_SIGNATURE as string,
  REFRESH_USER_SIGNATURE: process.env.REFRESH_USER_SIGNATURE as string,
  REFRESH_ADMIN_SIGNATURE: process.env.REFRESH_ADMIN_SIGNATURE as string,
  ACCESS_TOKEN_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 3600,
  REFRESH_TOKEN_EXPIRES_IN:
    Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 604800,

  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY as string,

  WHITELIST: process.env.WHITELIST as string,

  FIREBASE_SERVICE_ACCOUNT: "./config/firebase",
};

export type Env = typeof env;
