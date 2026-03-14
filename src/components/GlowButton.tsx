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
        "group/btn relative rounded-full border-[0.6px] border-foreground/30 p-[1px]",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-foreground/50 hover:scale-[1.02] active:scale-[0.98]",
        "hover:shadow-[0_0_24px_rgba(255,255,255,0.12)]",
        className
      )}
      {...props}
    >
      {/* Glow streak — intensifies on hover */}
      <span
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 h-[6px] rounded-full pointer-events-none z-10",
          "bg-[radial-gradient(ellipse_at_center,_hsla(0,0%,100%,0.45)_0%,_transparent_70%)]",
          "w-[60%] group-hover/btn:w-[80%] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover/btn:bg-[radial-gradient(ellipse_at_center,_hsla(0,0%,100%,0.6)_0%,_transparent_70%)]"
        )}
      />

      <span
        className={cn(
          "relative block rounded-full px-[29px] py-[11px] text-[14px] font-medium",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover/btn:translate-y-[-1px]",
          isDark
            ? "bg-background text-foreground group-hover/btn:bg-foreground/[0.04]"
            : "bg-foreground text-background group-hover/btn:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        )}
      >
        {children}
      </span>
    </button>
  );
};

export default GlowButton;
