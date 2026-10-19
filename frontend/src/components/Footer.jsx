import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto my-12 px-6 py-12 rounded-3xl macos-island-sidebar text-slate-600 dark:text-slate-300 shadow-2xl">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center font-display font-bold text-white shadow-sm border border-white/40">
              E
            </div>
            <span className="font-display font-semibold text-slate-900 dark:text-white text-base">EduCloud</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            A peaceful cloud-based student management system built for modern institutions.
          </p>
        </div>
        <div>
          <p className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">Product</p>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><Link to="/#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">How it works</Link></li>
            <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-white transition-colors">Login</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">Company</p>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><Link to="/#about" className="hover:text-blue-600 dark:hover:text-white transition-colors">About</Link></li>
            <li><Link to="/#contact" className="hover:text-blue-600 dark:hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">Contact</p>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li>support@educloud.edu</li>
            <li>+91 80000 12345</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 dark:border-white/10 mt-10 pt-5 text-center text-xs text-slate-400 dark:text-slate-500">
        © 2026 EduCloud. Built for academic institutions. All rights reserved.
      </div>
    </footer>
  );
}
