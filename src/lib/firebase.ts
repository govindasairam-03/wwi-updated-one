import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Config copied verbatim from Firebase Console → Project settings → wwi (web app)
const firebaseConfig = {
  apiKey: "AIzaSyAp2iwOFS5jMz54eITwqcolC2-HBbXyf8w",
  authDomain: "wwi-websie.firebaseapp.com",
  projectId: "wwi-websie",
  storageBucket: "wwi-websie.firebasestorage.app",
  messagingSenderId: "657168097728",
  appId: "1:657168097728:web:cf9364ea93f170d1b8e825",
  measurementId: "G-Q1T6WD4SJF",
};

const isNew = getApps().length === 0;
export const app = isNew ? initializeApp(firebaseConfig) : getApp();
// initializeFirestore must run before getFirestore on a fresh app — enables
// ignoreUndefinedProperties so optional form fields (jobId, etc.) don't crash addDoc.
export const db = isNew
  ? initializeFirestore(app, { ignoreUndefinedProperties: true })
  : getFirestore(app);
export const auth = getAuth(app);

export async function getAnalyticsClient() {
  if (typeof window === "undefined") return null;
  const { isSupported, getAnalytics } = await import("firebase/analytics");
  if (!(await isSupported())) return null;
  return getAnalytics(app);
}
