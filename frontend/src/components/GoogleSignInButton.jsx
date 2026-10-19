import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { signInWithGoogle, isFirebaseConfigured } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function GoogleSignInButton({ role, text = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [demoGoogleUser, setDemoGoogleUser] = useState({ name: "", email: "" });
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleGoogleClick() {
    const selectedRole = role || "student";

    if (!isFirebaseConfigured) {
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const user = await loginWithGoogle({ googleUser, role: selectedRole });
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      if (err.message?.includes("FIREBASE_NOT_CONFIGURED")) {
        setShowConfigModal(true);
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.info("Google sign-in was cancelled.");
      } else {
        toast.error(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoSubmit(e) {
    e.preventDefault();
    if (!demoGoogleUser.email || !demoGoogleUser.name) {
      toast.error("Please enter your name and email.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithGoogle({
        googleUser: {
          name: demoGoogleUser.name.trim(),
          email: demoGoogleUser.email.trim(),
          avatar: demoGoogleUser.name.slice(0, 2).toUpperCase(),
          uid: `goog_${Date.now()}`,
        },
        role: role || "student",
      });
      setShowConfigModal(false);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      toast.error(err.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleClick}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-border bg-white hover:bg-navy-50 text-navy-800 font-semibold text-sm transition-all shadow-sm hover:shadow"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-navy-600" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{text}</span>
      </button>

      {/* Helper Modal when Firebase keys are pending */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-border">
            <h3 className="text-lg font-bold text-navy-900 mb-2">Google Sign-In Setup</h3>
            <p className="text-xs text-navy-500 mb-4">
              Firebase credentials are not set in your <code className="bg-navy-50 px-1 py-0.5 rounded text-navy-800">.env</code> yet.
              You can test Google sign-in right now by typing your details, or paste your Firebase config.
            </p>

            <form onSubmit={handleDemoSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-navy-700">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ranjan Hegde"
                  value={demoGoogleUser.name}
                  onChange={(e) => setDemoGoogleUser((u) => ({ ...u, name: e.target.value }))}
                  className="input mt-1 text-sm !py-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-700">Google Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={demoGoogleUser.email}
                  onChange={(e) => setDemoGoogleUser((u) => ({ ...u, email: e.target.value }))}
                  className="input mt-1 text-sm !py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary flex-1 !py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 !py-2 text-xs"
                >
                  {loading ? "Signing in..." : "Continue as Google User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
