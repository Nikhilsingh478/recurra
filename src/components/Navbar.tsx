import { useState } from "react";
import { X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlowButton from "./GlowButton";

const navLinks = ["Get Started", "Developers", "Features", "Resources"];

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
          LOGOIPSUM
        </span>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-[30px]">
          {navLinks.map((link, i) => (
            <motion.a
              key={link}
              href="#"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative text-[14px] font-medium text-foreground/70 hover:text-foreground transition-colors duration-300 py-1"
            >
              {link}
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-full h-px bg-foreground origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              {/* Glow on hover */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[4px] bg-foreground/0 group-hover:bg-foreground/20 blur-[4px] transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block"
          >
            <GlowButton variant="dark">Join Waitlist</GlowButton>
          </motion.div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-foreground p-1"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-background/95 backdrop-blur-2xl border-l border-foreground/10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <span className="text-foreground font-semibold text-lg tracking-tight">LOGOIPSUM</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground/70 hover:text-foreground transition-colors p-1"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mx-6 h-px bg-foreground/10" />

              {/* Links */}
              <div className="flex flex-col px-6 py-6 gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link}
                    href="#"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="py-4 text-[16px] font-medium text-foreground/80 hover:text-foreground hover:pl-2 transition-all duration-300"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>

              <div className="mx-6 h-px bg-foreground/10" />

              {/* CTA */}
              <motion.div
                className="px-6 py-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlowButton variant="light" className="w-full">
                  Join Waitlist
                </GlowButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
