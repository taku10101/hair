import * as admin from "firebase-admin";
import { env } from "@/lib/env";

let app: admin.app.App | null = null;

/**
 * Firebase Admin SDK initialization
 * Singleton pattern to ensure only one instance
 */
export const getFirebaseAdmin = (): admin.app.App => {
  if (app) {
    return app;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      "Firebase Admin SDK credentials are not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables."
    );
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: FIREBASE_CLIENT_EMAIL,
    }),
  });

  return app;
};

/**
 * Get Firebase Auth instance
 */
export const getAuth = (): admin.auth.Auth => {
  return getFirebaseAdmin().auth();
};
