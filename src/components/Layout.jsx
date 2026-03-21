import { useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItem = ({ isActive }) =>
    isActive
      ? "font-semibold text-cyan-400"
      : "text-white/70 hover:text-white";

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="rounded-2xl bg-cyan-500/10 p-2"
            >
              <FileText className="h-6 w-6 text-cyan-400" />
            </motion.div>

            <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              PDFNova
            </span>
          </Link>

          <nav className="hidden gap-6 text-sm lg:flex">
            <NavLink to="/" className={navItem}>Home</NavLink>
            <NavLink to="/merge-pdf" className={navItem}>Merge</NavLink>
            <NavLink to="/split-pdf" className={navItem}>Split</NavLink>
            <NavLink to="/compress-pdf" className={navItem}>Compress</NavLink>
            <NavLink to="/pdf-to-word" className={navItem}>Word</NavLink>
            <NavLink to="/protect-pdf" className={navItem}>Protect</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/merge-pdf"
              className="hidden rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400 md:inline-block"
            >
              Start
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl border border-white/10 p-2 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-white/10 bg-[#0b1020] lg:hidden"
            >
              <div className="flex flex-col gap-4 px-4 py-4 text-sm">
                <NavLink onClick={() => setMenuOpen(false)} to="/" className={navItem}>Home</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/merge-pdf" className={navItem}>Merge PDF</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/split-pdf" className={navItem}>Split PDF</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/compress-pdf" className={navItem}>Compress PDF</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/jpg-to-pdf" className={navItem}>JPG to PDF</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/pdf-to-word" className={navItem}>PDF to Word</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/protect-pdf" className={navItem}>Protect PDF</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/privacy-policy" className={navItem}>Privacy Policy</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/terms" className={navItem}>Terms</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} to="/contact" className={navItem}>Contact</NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/50">
        <p>© 2026 PDFNova. All rights reserved.</p>

        <div className="mt-2 flex justify-center gap-4">
          <Link to="/privacy-policy" className="hover:text-cyan-400">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-cyan-400">
            Terms
          </Link>
          <Link to="/contact" className="hover:text-cyan-400">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}