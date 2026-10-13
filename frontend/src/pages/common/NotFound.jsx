import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface-muted">
      <div className="rounded-full bg-navy-50 p-4 text-navy-400 mb-4"><Compass size={28} /></div>
      <h1 className="text-3xl font-display font-semibold text-navy-900">Page not found</h1>
      <p className="text-navy-400 mt-2 max-w-sm">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
