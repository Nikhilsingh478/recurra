import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GlowButton from "./GlowButton";

const navLinks: { name: string; href: string }[] = [
  { name: "Docs", href: "/docs" },
  { name: "Process", href: "/process" },
  { name: "Analyze", href: "/analyze" },
  { name: "Features", href: "/features" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex items-center justify-between px-6 md:px-[120px] py-[20px]"
      >
        {/* Logo */}
        <span
          className="text-foreground font-semibold text-lg tracking-tight select-none"
          style={{ width: 187, height: 25, display: "flex", alignItems: "center" }}
        >
          RECURRA
        </span>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-[30px]">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={link.href}
                className="group relative block text-[14px] font-medium text-foreground/70 hover:text-foreground transition-colors duration-300 py-1"
              >
                {link.name}
              <span className="absolute bottom-0 left-0 w-full h-px bg-foreground origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[4px] bg-foreground/0 group-hover:bg-foreground/20 blur-[4px] transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block"
          >
            <Link to="/analyze">
              <GlowButton variant="dark">Generate Probables</GlowButton>
            </Link>
          </motion.div>

          {/* Mobile — morphing hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-foreground rounded-full hover:bg-foreground/5 active:scale-95 transition-transform duration-200"
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="block w-full h-[1.5px] rounded-full bg-current origin-center transition-all duration-300" />
              <span className="block w-[80%] h-[1.5px] rounded-full bg-current origin-left ml-auto transition-all duration-300" />
              <span className="block w-full h-[1.5px] rounded-full bg-current origin-center transition-all duration-300" />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu — full-screen award-level overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop with gradient vignette */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)",
              }}
            />

            {/* Close button — morphing X */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(false);
              }}
              className="absolute top-6 right-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-foreground/10 active:scale-95 transition-all duration-300"
              aria-label="Close menu"
            >
              <div className="relative w-5 h-5">
                <span className="absolute inset-0 m-auto w-full h-[1.5px] bg-current rounded-full rotate-45" />
                <span className="absolute inset-0 m-auto w-full h-[1.5px] bg-current rounded-full -rotate-45" />
              </div>
            </motion.button>

            {/* Content — centered vertical stack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="relative z-10 flex flex-col min-h-screen px-8 pt-24 pb-12 pointer-events-none"
            >
              {/* Brand */}
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-foreground/50 text-[11px] font-medium tracking-[0.2em] uppercase mb-16"
              >
                Recurra
              </motion.span>

              {/* Nav links — large typography, staggered spring */}
              <nav className="flex-1 flex flex-col justify-center -mt-24 pointer-events-auto">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                    transition={{
                      duration: 0.6,
                      delay: 0.25 + i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group block py-5 border-b border-foreground/5 last:border-0"
                    >
                    <span className="text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-foreground/90 group-hover:text-foreground transition-colors duration-300 inline-block group-active:scale-[0.98]">
                      {link.name}
                    </span>
                    <span className="block mt-1 text-[12px] font-medium text-foreground/30 group-hover:text-foreground/50 transition-colors duration-300">
                      {link.name === "Docs" && "Documentation & guides"}
                      {link.name === "Process" && "How it works"}
                      {link.name === "Analyze" && "Pattern detection"}
                      {link.name === "Features" && "What we offer"}
                    </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA — anchored at bottom */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="pt-8 pointer-events-auto"
              >
                <Link to="/analyze" className="block" onClick={() => setMobileOpen(false)}>
                  <GlowButton variant="light" className="w-full py-4 text-base">
                    Generate Probables
                  </GlowButton>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
