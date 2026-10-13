import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "educloud_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore saved session from localStorage or sessionStorage.
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // Corrupted stored session — ignore and require a fresh login.
      }
    }
    setLoading(false);
  }, []);

  async function login({ remember, ...credentials }) {
    const res = await authService.login(credentials);
    setUser(res.user);
    // "Remember me" checked -> persists across browser restarts (localStorage).
    // Unchecked -> cleared when the browser tab/session ends (sessionStorage).
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
      localStorage.removeItem(STORAGE_KEY);
    }
    return res.user;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Lets Settings (and any other page) update the logged-in user's own
  // profile fields and have it actually persist and reflect immediately,
  // instead of the Save button always showing success with nothing saved.
  function updateProfile(updates) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      if (localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
