import { cn } from "@/lib/utils";
import React from "react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "dark" | "light";
  children: React.ReactNode;
}

const GlowButton: React.FC<GlowButtonProps> = ({ variant = "dark", children, className, ...props }) => {
  const isDark = variant === "dark";

  return (
    <button
      className={cn(
        "relative rounded-full border-[0.6px] border-foreground/30 p-[1px]",
        className
      )}
      {...props}
    >
      {/* Glow streak */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[6px] bg-[radial-gradient(ellipse_at_center,_hsla(0,0%,100%,0.45)_0%,_transparent_70%)] pointer-events-none z-10" />
      
      <span
        className={cn(
          "relative block rounded-full px-[29px] py-[11px] text-[14px] font-medium transition-opacity hover:opacity-90",
          isDark ? "bg-background text-foreground" : "bg-foreground text-background"
        )}
      >
        {children}
      </span>
    </button>
  );
};

export default GlowButton;
