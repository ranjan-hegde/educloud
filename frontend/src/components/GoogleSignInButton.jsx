import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, GraduationCap, Users, Shield } from "lucide-react";
import { signInWithGoogle, isFirebaseConfigured } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function checkExistingUser(email) {
  try {
    const registered = JSON.parse(localStorage.getItem("educloud_registered_users")) || {};
    return registered[email.trim().toLowerCase()] || null;
  } catch {
    return null;
  }
}

export default function GoogleSignInButton({ role, text = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [demoGoogleUser, setDemoGoogleUser] = useState({ name: "", email: "" });
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleGoogleClick() {
    if (!isFirebaseConfigured) {
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const existingAccount = checkExistingUser(googleUser.email);

      // If already registered OR role was pre-selected, proceed directly!
      if (existingAccount || role) {
        const user = await loginWithGoogle({
          googleUser,
          role: existingAccount?.profile?.role || role || "student",
          remember: true,
        });
        toast.success(`Welcome, ${user.name}!`);
        navigate(`/${user.role}/dashboard`, { replace: true });
      } else {
        // Brand new user without pre-selected role: ask them for role!
        setPendingGoogleUser(googleUser);
        setShowRoleModal(true);
      }
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

  async function completeGoogleWithRole(chosenRole) {
    if (!pendingGoogleUser) return;
    setLoading(true);
    try {
      const user = await loginWithGoogle({
        googleUser: pendingGoogleUser,
        role: chosenRole,
        remember: true,
      });
      setShowRoleModal(false);
      toast.success(`Account created! Welcome to EduCloud, ${user.name}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to complete account registration.");
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
      const gUser = {
        name: demoGoogleUser.name.trim(),
        email: demoGoogleUser.email.trim(),
        avatar: demoGoogleUser.name.slice(0, 2).toUpperCase(),
        uid: `goog_${Date.now()}`,
      };
      const existingAccount = checkExistingUser(gUser.email);

      if (existingAccount || role) {
        const user = await loginWithGoogle({
          googleUser: gUser,
          role: existingAccount?.profile?.role || role || "student",
          remember: true,
        });
        setShowConfigModal(false);
        toast.success(`Welcome, ${user.name}!`);
        navigate(`/${user.role}/dashboard`, { replace: true });
      } else {
        setShowConfigModal(false);
        setPendingGoogleUser(gUser);
        setShowRoleModal(true);
      }
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
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md hover:bg-white text-navy-900 font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-[0.99]"
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

      {/* Role Picker Modal for New Google Users */}
      {showRoleModal && pendingGoogleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-sm w-full p-6 shadow-glass-lg border border-white/80 text-center">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-accent-teal flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={26} />
            </div>
            <h3 className="text-xl font-display font-bold text-navy-950">One last step!</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Welcome, <span className="font-semibold text-navy-800">{pendingGoogleUser.name}</span>. Select your campus role to complete your profile:
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => completeGoogleWithRole("student")}
                className="w-full p-3 rounded-2xl border border-slate-200/90 hover:border-accent-teal hover:bg-teal-50/50 flex items-center gap-3 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-700">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">I am a Student</p>
                  <p className="text-[11px] text-slate-500">Access classes, attendance, grades and assignments</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => completeGoogleWithRole("faculty")}
                className="w-full p-3 rounded-2xl border border-slate-200/90 hover:border-accent-teal hover:bg-teal-50/50 flex items-center gap-3 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-700">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">I am a Faculty Member</p>
                  <p className="text-[11px] text-slate-500">Manage courses, mark attendance, and evaluate students</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => completeGoogleWithRole("admin")}
                className="w-full p-3 rounded-2xl border border-slate-200/90 hover:border-accent-teal hover:bg-teal-50/50 flex items-center gap-3 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-slate-500/10 text-slate-700">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">Institution Administrator</p>
                  <p className="text-[11px] text-slate-500">Campus-wide control and reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Modal when Firebase keys are pending in environment */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-glass-lg border border-white/80">
            <h3 className="text-lg font-bold text-navy-950 mb-1">Direct Google Profile Sign-In</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your name and email to test your Google authentication flow.
            </p>

            <form onSubmit={handleDemoSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Your Full Name</label>
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
                <label className="text-xs font-semibold text-slate-600">Google Email</label>
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
                  {loading ? "Signing in..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
