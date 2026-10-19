import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";
import { setCookie, getCookie, deleteCookie } from "../utils/cookieUtils";

const AuthContext = createContext(null);
const STORAGE_KEY = "educloud_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore saved session from localStorage, sessionStorage, or cookies.
    const stored =
      localStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem(STORAGE_KEY) ||
      getCookie(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          if (parsed.id !== undefined && parsed.id !== null) {
            parsed.id = String(parsed.id);
          }
          setUser(parsed);
        }
      } catch {
        // Corrupted stored session — ignore and require a fresh login.
      }
    }
    setLoading(false);
  }, []);

  async function login({ remember, ...credentials }) {
    const res = await authService.login(credentials);
    const normalizedUser = {
      ...res.user,
      id: String(res.user.id || `USR${Date.now().toString().slice(-4)}`),
    };
    setUser(normalizedUser);
    setCookie(STORAGE_KEY, JSON.stringify(normalizedUser), remember ? 30 : null);
    // "Remember me" checked -> persists across browser restarts (localStorage).
    // Unchecked -> cleared when the browser tab/session ends (sessionStorage).
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      localStorage.removeItem(STORAGE_KEY);
    }
    return normalizedUser;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    deleteCookie(STORAGE_KEY);
    deleteCookie("educloud_token");
  }

  // Lets Settings (and any other page) update the logged-in user's own
  // profile fields and have it actually persist and reflect immediately,
  // instead of the Save button always showing success with nothing saved.
  function updateProfile(updates) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      if (next.id !== undefined && next.id !== null) next.id = String(next.id);
      const str = JSON.stringify(next);
      setCookie(STORAGE_KEY, str, 30);
      if (localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, str);
      else sessionStorage.setItem(STORAGE_KEY, str);
      return next;
    });
  }

  async function loginWithGoogle({ googleUser, role, remember = true }) {
    const res = await authService.loginWithGoogle({ googleUser, role });
    const normalizedUser = {
      ...res.user,
      id: String(res.user.id || `GOOG${Date.now().toString().slice(-4)}`),
    };
    setUser(normalizedUser);
    setCookie(STORAGE_KEY, JSON.stringify(normalizedUser), remember ? 30 : null);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      localStorage.removeItem(STORAGE_KEY);
    }
    return normalizedUser;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
