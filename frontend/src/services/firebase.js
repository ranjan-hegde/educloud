// Firebase configuration & Google Authentication
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your-api-key" &&
  firebaseConfig.authDomain
);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (err) {
    console.warn("Firebase initialization failed:", err);
  }
}

/**
 * Sign in using Google OAuth Popup.
 * Returns an object with { name, email, avatar, uid, idToken }
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      "FIREBASE_NOT_CONFIGURED: Please configure your Firebase credentials in .env (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.)"
    );
  }

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    avatar: user.photoURL || (user.displayName?.slice(0, 2)?.toUpperCase() || "U"),
    uid: user.uid,
    idToken,
  };
}

export async function signOutGoogle() {
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }
}

export { auth, googleProvider };
