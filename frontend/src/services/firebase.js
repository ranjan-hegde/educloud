// Firebase configuration & Google Authentication
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCRSmgpTycIxr0t20OF-aCvzzqtNRV76B0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "educloud-d1ad6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "educloud-d1ad6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "educloud-d1ad6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "134765578750",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:134765578750:web:6e4a678186816cb11b98af",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NEWNLQQKW5",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain
);

let firebaseModule = null;

async function loadFirebase() {
  if (firebaseModule) return firebaseModule;
  try {
    const { initializeApp, getApps, getApp } = await import(/* @vite-ignore */ "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import(/* @vite-ignore */ "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js");
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    firebaseModule = { app, auth, googleProvider, signInWithPopup, signOut };
    return firebaseModule;
  } catch (err) {
    console.warn("Firebase CDN initialization failed:", err);
    return null;
  }
}

// Preload if in browser environment
if (typeof window !== "undefined" && isFirebaseConfigured) {
  loadFirebase().catch(() => {});
}

/**
 * Sign in using Google OAuth Popup.
 * Returns an object with { name, email, avatar, uid, idToken }
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "FIREBASE_NOT_CONFIGURED: Please configure your Firebase credentials."
    );
  }

  const fb = await loadFirebase();
  if (!fb || !fb.auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED: Unable to load Firebase auth service.");
  }

  const result = await fb.signInWithPopup(fb.auth, fb.googleProvider);
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
  const fb = await loadFirebase();
  if (fb?.auth) {
    try {
      await fb.signOut(fb.auth);
    } catch {
      // ignore
    }
  }
}
