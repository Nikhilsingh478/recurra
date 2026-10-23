import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GlowButton from "./GlowButton";

const navLinks: { name: string; href: string }[] = [
  { name: "Docs", href: "/docs" },
  { name: "Process", href: "/process" },
  { name: "Analyze", href: "/analyze" },
  { name: "Features", href: "/features" },
];

const MENU_EXIT_MS = 300;

const Navbar = () => {
  const [menu, setMenu] = useState<"closed" | "open" | "closing">("closed");
  const closeTimer = useRef<number>();

  const openMenu = () => {
    window.clearTimeout(closeTimer.current);
    setMenu("open");
  };
  const closeMenu = () => {
    setMenu("closing");
    closeTimer.current = window.setTimeout(() => setMenu("closed"), MENU_EXIT_MS);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const closing = menu === "closing";

  return (
    <>
      <nav
        className="enter-fade-up relative z-20 flex items-center justify-between px-6 md:px-[120px] py-[20px]"
        style={{ "--enter-y": "-20px", animationDuration: "0.8s" } as React.CSSProperties}
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-foreground font-semibold text-lg tracking-tight select-none hover:opacity-80 transition-opacity duration-200"
          style={{ width: 187, height: 25, display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          RECURRA
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-[30px]">
          {navLinks.map((link, i) => (
            <div
              key={link.name}
              className="enter-fade-up"
              style={{ "--enter-y": "-10px", animationDuration: "0.5s", animationDelay: `${0.3 + i * 0.08}s` } as React.CSSProperties}
            >
              <Link
                to={link.href}
                className="group relative block text-[14px] font-medium text-foreground/70 hover:text-foreground transition-colors duration-300 py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-full h-px bg-foreground origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[4px] bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
              </Link>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div
            className="enter-fade-up hidden md:block"
            style={{ "--enter-y": "0px", "--enter-scale": 0.9, animationDuration: "0.5s", animationDelay: "0.6s" } as React.CSSProperties}
          >
            <Link to="/analyze">
              <GlowButton variant="dark">Generate Probables</GlowButton>
            </Link>
          </div>

          {/* Mobile — morphing hamburger */}
          <button
            onClick={openMenu}
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
      </nav>

      {/* Mobile Menu — full-screen award-level overlay */}
      {menu !== "closed" && (
          <div className={`${closing ? "exit-fade" : "enter-fade"} fixed inset-0 z-50 md:hidden`}>
            {/* Backdrop with gradient vignette */}
            <div
              className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
              onClick={closeMenu}
              style={{
                background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)",
              }}
            />

            {/* Close button — morphing X */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeMenu();
              }}
              className="enter-fade-up absolute top-6 right-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-foreground/10 active:scale-95 transition-all duration-300"
              aria-label="Close menu"
              style={{ "--enter-y": "0px", "--enter-scale": 0.8, animationDuration: "0.3s", animationDelay: "0.1s" } as React.CSSProperties}
            >
              <div className="relative w-5 h-5">
                <span className="absolute inset-0 m-auto w-full h-[1.5px] bg-current rounded-full rotate-45" />
                <span className="absolute inset-0 m-auto w-full h-[1.5px] bg-current rounded-full -rotate-45" />
              </div>
            </button>

            {/* Content — centered vertical stack */}
            <div
              className="relative z-10 flex flex-col min-h-screen px-8 pt-24 pb-12 pointer-events-none"
            >
              {/* Brand */}
              <span
                className="enter-fade-up block text-foreground/70 text-[11px] font-medium tracking-[0.2em] uppercase mb-16"
                style={{ "--enter-y": "-20px", animationDuration: "0.5s", animationDelay: "0.2s" } as React.CSSProperties}
              >
                Recurra
              </span>

              {/* Nav links — large typography, staggered spring */}
              <nav className="flex-1 flex flex-col justify-center -mt-24 pointer-events-auto">
                {navLinks.map((link, i) => (
                  <div
                    key={link.name}
                    className="enter-fade-up"
                    style={{ "--enter-y": "24px", animationDuration: "0.6s", animationDelay: `${0.25 + i * 0.08}s` } as React.CSSProperties}
                  >
                    <Link
                      to={link.href}
                      onClick={closeMenu}
                      className="group block py-5 border-b border-foreground/5 last:border-0"
                    >
                      <span className="text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] text-foreground/90 group-hover:text-foreground transition-colors duration-300 inline-block group-active:scale-[0.98]">
                        {link.name}
                      </span>
                      <span className="block mt-1 text-[12px] font-medium text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300">
                        {link.name === "Docs" && "Documentation & guides"}
                        {link.name === "Process" && "How it works"}
                        {link.name === "Analyze" && "Pattern detection"}
                        {link.name === "Features" && "What we offer"}
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>

              {/* CTA — anchored at bottom */}
              <div
                className="enter-fade-up pt-8 pointer-events-auto"
                style={{ "--enter-y": "30px", animationDuration: "0.6s", animationDelay: "0.6s" } as React.CSSProperties}
              >
                <Link to="/analyze" className="block" onClick={closeMenu}>
                  <GlowButton variant="light" className="w-full py-4 text-base">
                    Generate Probables
                  </GlowButton>
                </Link>
              </div>
            </div>
          </div>
      )}
    </>
  );
};

export default Navbar;
