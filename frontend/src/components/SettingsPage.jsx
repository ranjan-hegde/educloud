import { useState } from "react";
import { Save, Bell, Palette, Globe, Lock, User, DatabaseZap, RotateCcw } from "lucide-react";
import PageHeader from "./PageHeader";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as storageService from "../services/storageService";
import { usePersistentState } from "../hooks/usePersistentState";

const baseTabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "password", label: "Password", icon: Lock },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "theme", label: "Theme", icon: Palette },
  { key: "language", label: "Language", icon: Globe },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("profile");
  // BUG FIX: preferences used to live in plain useState, so "Save Changes"
  // showed a success toast but the values evaporated on refresh/logout.
  // usePersistentState actually writes them through to storage.
  const [prefs, setPrefs] = usePersistentState("userPreferences");
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const tabs = isAdmin ? [...baseTabs, { key: "data", label: "Data", icon: DatabaseZap }] : baseTabs;

  function saveProfile() {
    if (!profileForm.name.trim()) { toast.error("Full name cannot be empty."); return; }
    updateProfile({ name: profileForm.name.trim(), phone: profileForm.phone.trim() });
    toast.success("Profile updated successfully.");
  }

  function savePassword() {
    const errs = {};
    if (!pwForm.current) errs.current = "Enter your current password.";
    if (!pwForm.next) errs.next = "Enter a new password.";
    else if (pwForm.next.length < 8) errs.next = "New password must be at least 8 characters.";
    if (pwForm.next && pwForm.next === pwForm.current) errs.next = "New password must be different from the current password.";
    if (!pwForm.confirm) errs.confirm = "Confirm your new password.";
    else if (pwForm.next && pwForm.confirm !== pwForm.next) errs.confirm = "Passwords do not match.";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Do NOT show a success message when validation actually fails.
      return;
    }
    // Real password storage isn't wired up in this frontend-only phase —
    // be explicit about that rather than pretending it changed the login
    // credential, but do confirm the validated request was accepted.
    setPwForm({ current: "", next: "", confirm: "" });
    toast.success("Password change validated. It will take effect once connected to the backend.");
  }

  function savePrefs() {
    toast.success("Preferences saved successfully.");
  }

  function confirmReset() {
    storageService.resetAllData();
    toast.success("Demo data has been reset to its original values.");
    setResetConfirmOpen(false);
    // Reload so every page re-seeds cleanly from the restored mock data.
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-navy-800 text-white" : "text-navy-600 hover:bg-navy-50"}`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 card p-6">
          {tab === "profile" && (
            <div className="space-y-4 max-w-md">
              <div><label className="label">Full name</label><input className="input" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label">Email</label><input className="input" defaultValue={user?.email} disabled /></div>
              <div><label className="label">Phone</label><input className="input" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
          )}
          {tab === "password" && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="label">Current password</label>
                <input type="password" className="input" placeholder="••••••••" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} />
                {pwErrors.current && <p className="text-xs text-accent-coral mt-1">{pwErrors.current}</p>}
              </div>
              <div>
                <label className="label">New password</label>
                <input type="password" className="input" placeholder="••••••••" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} />
                {pwErrors.next && <p className="text-xs text-accent-coral mt-1">{pwErrors.next}</p>}
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input type="password" className="input" placeholder="••••••••" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
                {pwErrors.confirm && <p className="text-xs text-accent-coral mt-1">{pwErrors.confirm}</p>}
              </div>
              <p className="text-xs text-navy-400">Validated on the frontend; the actual credential change is mocked until a real backend is connected.</p>
              <button className="btn-primary" onClick={savePassword}><Save size={15} /> Change Password</button>
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-4 max-w-md">
              {[["email", "Email notifications"], ["sms", "SMS alerts"], ["push", "Push notifications"]].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm text-navy-700">{label}</span>
                  <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))} className="h-4 w-4 rounded border-navy-300" />
                </label>
              ))}
            </div>
          )}
          {tab === "theme" && (
            <div className="flex gap-3 max-w-md">
              {["light", "dark", "system"].map((th) => (
                <button
                  key={th}
                  onClick={() => setPrefs((p) => ({ ...p, theme: th }))}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize ${prefs.theme === th ? "border-navy-700 bg-navy-50 text-navy-800" : "border-surface-border text-navy-500"}`}
                >
                  {th}
                </button>
              ))}
            </div>
          )}
          {tab === "language" && (
            <div className="max-w-md">
              <label className="label">Preferred language</label>
              <select className="input" value={prefs.language} onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}>
                {["English", "Hindi", "Kannada"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          )}
          {tab === "data" && isAdmin && (
            <div className="max-w-md space-y-4">
              <div>
                <p className="text-sm font-semibold text-navy-900">Temporary Data Storage</p>
                <p className="text-xs text-navy-400 mt-1">
                  This frontend-only build stores all demo data (students, faculty, attendance, notifications, QR sessions, etc.) in your browser's local storage, since a real backend isn't connected yet.
                </p>
              </div>
              <div className="rounded-xl border border-surface-border p-4">
                <p className="text-sm font-medium text-navy-800 mb-1">Reset Demo Data</p>
                <p className="text-xs text-navy-400 mb-3">
                  Wipes any changes made during testing and restores the original mock dataset. Your login account is not affected.
                </p>
                <button className="btn-secondary" onClick={() => setResetConfirmOpen(true)}>
                  <RotateCcw size={15} /> Reset Demo Data
                </button>
              </div>
            </div>
          )}

          {tab === "profile" && <button className="btn-primary mt-6" onClick={saveProfile}><Save size={15} /> Save Changes</button>}
          {(tab === "notifications" || tab === "theme" || tab === "language") && <button className="btn-primary mt-6" onClick={savePrefs}><Save size={15} /> Save Changes</button>}
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={confirmReset}
        title="Reset Demo Data"
        message="Are you sure you want to reset all demo data? This will restore Students, Faculty, Attendance, Notifications, QR Sessions, and all other temporary data to their original values."
        confirmLabel="Reset Data"
        danger
      />
    </div>
  );
}
