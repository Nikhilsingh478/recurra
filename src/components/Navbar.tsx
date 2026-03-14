import { ChevronDown } from "lucide-react";
import GlowButton from "./GlowButton";

const navLinks = ["Get Started", "Developers", "Features", "Resources"];

const Navbar = () => {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 md:px-[120px] py-[20px]">
      {/* Logo */}
      <div className="flex items-center gap-[30px]">
        <span
          className="text-foreground font-semibold text-lg tracking-tight select-none"
          style={{ width: 187, height: 25, display: "flex", alignItems: "center" }}
        >
          LOGOIPSUM
        </span>

        {/* Nav Links - hidden on mobile */}
        <div className="hidden md:flex items-center gap-[30px]">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="flex items-center gap-[14px] text-[14px] font-medium text-foreground hover:opacity-80 transition-opacity"
            >
              {link}
              <ChevronDown size={14} />
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <GlowButton variant="dark">Join Waitlist</GlowButton>
    </nav>
  );
};

export default Navbar;
