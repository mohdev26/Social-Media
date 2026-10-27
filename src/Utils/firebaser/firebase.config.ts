import admin from "firebase-admin";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { env } from "../../config/config.service";

let messaging: admin.messaging.Messaging | null = null;

export const intializeFirebase = (): void => {
  const keyPath = resolve(env.FIREBASE_SERVICE_ACCOUNT);
  if (!existsSync(keyPath)) {
    throw new Error(
      `Firebase service account key file not found at path: ${keyPath}`,
    );
  }
  try {
    const serviceAccount = JSON.parse(
      readFileSync(keyPath, "utf-8"),
    ) as admin.ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    messaging = admin.messaging();
    console.log("[Firebase] Admn SDK intialized successfully.");
  } catch (error) {
    console.error("[Firebase] Error initializing Admin SDK:", error);
  }
};
export const getMessaging = (): admin.messaging.Messaging | null => messaging;

export {admin};