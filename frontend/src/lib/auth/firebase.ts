import { type FirebaseApp, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { env } from "@/lib/env";

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/**
 * Firebase Appインスタンスを取得（シングルトン）
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (app) return app;

  app = initializeApp(firebaseConfig);
  return app;
};

/**
 * Firebase Authインスタンスを取得（シングルトン）
 */
export const getFirebaseAuth = (): Auth => {
  if (auth) return auth;

  const firebaseApp = getFirebaseApp();
  auth = getAuth(firebaseApp);

  // 開発環境でエミュレータを使用する場合
  if (import.meta.env.DEV && env.VITE_USE_AUTH_EMULATOR === "true") {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  }

  return auth;
};
