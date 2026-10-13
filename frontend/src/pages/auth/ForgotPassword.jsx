import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import * as authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }
    setError("");
    setLoading(true);
    await authService.forgotPassword(email);
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
          <MailCheck size={26} />
        </div>
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-navy-400 mt-2">We've sent password reset instructions to <span className="font-medium text-navy-700">{email}</span>.</p>
        <Link to="/login" className="btn-primary mt-6 inline-flex">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold">Forgot your password?</h1>
      <p className="text-sm text-navy-400 mt-1.5">Enter your email and we'll send you reset instructions.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {error && <p className="text-xs text-accent-coral mt-1">{error}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send reset instructions"}
        </button>
      </form>

      <p className="text-sm text-navy-500 text-center mt-6">
        <Link to="/login" className="text-navy-800 font-semibold hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
