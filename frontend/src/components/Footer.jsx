import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-accent-teal flex items-center justify-center font-display font-bold text-navy-950">E</div>
            <span className="font-display font-semibold text-white">EduCloud</span>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed">A cloud-based student management system built for modern institutions.</p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Product</p>
          <ul className="space-y-2 text-sm text-navy-400">
            <li><Link to="/#features" className="hover:text-white">Features</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Company</p>
          <ul className="space-y-2 text-sm text-navy-400">
            <li><Link to="/#about" className="hover:text-white">About</Link></li>
            <li><Link to="/#contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-navy-400">
            <li>support@educloud.edu</li>
            <li>+91 80000 12345</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800 py-5 text-center text-xs text-navy-500">
        © 2026 EduCloud. Built for academic institutions. All rights reserved.
      </div>
    </footer>
  );
}
